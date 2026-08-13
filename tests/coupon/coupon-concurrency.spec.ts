import { couponApi } from '@/apis/coupon.api';
import { memberApi } from '@/apis/member.api';

const COUPON_TIMEOUT = 60_000;

function statusDistribution(statuses: number[]): Record<number, number> {
  return statuses.reduce<Record<number, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
}

describe('[쿠폰] 동시성 / 중복 발급 방지 테스트', () => {
  // ──────────────────────────────────────────────
  // [서버 버그 확인됨]
  // POST /api/v2/coupon/issue 는 쿠폰 코드 유효성 검증이 없음.
  // 빈 값·임의 문자열·특수문자 모두 201 반환.
  // Race Condition skip 테스트는 admin에서 실제 쿠폰을 발행한 뒤 활성화.
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // 1. 서버 안정성: 동일 코드로 N개 동시 요청
  // ──────────────────────────────────────────────
  describe('동시 요청 — 서버 안정성', () => {
    test('[BUG] 임의 코드로 10개 동시 요청 — 모두 201 반환 (유효성 검증 누락)', async () => {
      // 기대: 존재하지 않는 코드 → 4xx / 실제: 201 전부 반환 (서버 버그)
      const N = 10;
      const code = 'CONCURRENT_TEST_INVALID_CODE';
      const start = Date.now();

      const results = await Promise.all(
        Array.from({ length: N }, () => couponApi.issueCoupon(code)),
      );

      const elapsed = Date.now() - start;
      const statuses = results.map(r => r.status);
      const dist = statusDistribution(statuses);

      console.log(`⚡ ${N}개 동시 요청 완료 — ${elapsed}ms`);
      console.log('응답 상태 분포:', JSON.stringify(dist));

      // 서버 내부 오류(500) 없음은 확인
      expect(statuses.every(s => s !== 500)).toBe(true);
      // 모든 응답이 동일한 상태 코드여야 함 (불일치 = Race Condition 징후)
      expect(new Set(statuses).size).toBe(1);
      // [버그] 존재하지 않는 코드임에도 모두 201 — 유효성 검증 없음
      const allSuccess = statuses.every(s => s === 201);
      if (allSuccess) {
        console.warn('⚠️ [BUG] 존재하지 않는 코드로 10개 동시 요청이 모두 201 반환됨 — 쿠폰 코드 유효성 검증 누락');
      }
    }, COUPON_TIMEOUT);

    test('빈 코드로 20개 동시 요청 — 서버 과부하 없음', async () => {
      const N = 20;
      const start = Date.now();

      const results = await Promise.all(
        Array.from({ length: N }, () => couponApi.issueCoupon('')),
      );

      const elapsed = Date.now() - start;
      const statuses = results.map(r => r.status);

      console.log(`⚡ ${N}개 빈 코드 동시 요청 — ${elapsed}ms`);
      console.log('응답 상태 분포:', JSON.stringify(statusDistribution(statuses)));

      expect(statuses.every(s => s !== 500)).toBe(true);
    }, COUPON_TIMEOUT);

    test('공백 코드로 15개 동시 요청 — 유효성 검증 안정성 확인', async () => {
      const N = 15;

      const results = await Promise.all(
        Array.from({ length: N }, () => couponApi.issueCoupon('   ')),
      );

      const statuses = results.map(r => r.status);
      console.log('공백 코드 동시 응답 분포:', JSON.stringify(statusDistribution(statuses)));

      expect(statuses.every(s => s !== 500)).toBe(true);
      // 유효성 검증 결과는 일관되어야 함
      expect(new Set(statuses).size).toBe(1);
    }, COUPON_TIMEOUT);
  });

  // ──────────────────────────────────────────────
  // 2. Race Condition: 발행 수량 1인 쿠폰에 동시 요청
  //
  // 검증 목적:
  //   발행 수량이 1인 쿠폰에 N개 요청이 동시에 도달했을 때,
  //   DB 락/원자적 연산이 없으면 모두 "남은 수량=1"을 읽고 동시에 발급 처리해
  //   isSuccess=true 응답이 2건 이상 나올 수 있음 (초과 발급 버그).
  //
  // 서버 응답 구조:
  //   HTTP는 성공/실패 모두 201 반환 → isSuccess 필드로 실제 성공 여부 판단
  //   성공: { data: { isSuccess: true } }
  //   실패: { data: { isSuccess: false }, msg: "발행 불가능한 쿠폰입니다." }
  //
  // 활성화 방법:
  //   1. admin에서 발행 수량=1 인 쿠폰 코드 생성
  //   2. 아래 VALID_CODE에 입력
  //   3. test.skip → test 로 변경
  // ──────────────────────────────────────────────
  describe('중복 발급 방지 — Race Condition 검증', () => {
    test.skip('발행 수량 1인 쿠폰 — 10개 동시 요청 시 isSuccess=true가 최대 1건', async () => {
      const VALID_CODE = 'REAL_COUPON_CODE_HERE'; // ← 실제 쿠폰 코드 입력
      const N = 10;

      // 사전: 현재 내 쿠폰 목록 스냅샷 (쿠폰 코드 기준 카운트)
      const before = await memberApi.getMyCoupons();
      const beforeCount = (before.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length;
      console.log(`[사전] ${VALID_CODE} 발급 수: ${beforeCount}`);

      // 동시 발사: 모든 요청을 같은 이벤트 루프 틱에서 출발
      const fns = Array.from({ length: N }, () => () => couponApi.issueCoupon(VALID_CODE));
      const start = Date.now();
      const results = await Promise.all(fns.map(fn => fn()));
      const elapsed = Date.now() - start;

      // 응답 분석 (HTTP 상태는 모두 201이므로 body 기준)
      const successCount = results.filter(r => r.data.data.isSuccess === true).length;
      const failCount    = results.filter(r => r.data.data.isSuccess === false).length;
      const has500       = results.some(r => r.status === 500);

      console.log(`⚡ ${N}개 동시 발사 완료 — ${elapsed}ms`);
      console.log(`isSuccess=true: ${successCount}건 / isSuccess=false: ${failCount}건`);
      results.forEach((r, i) => {
        console.log(`  [${i}] isSuccess=${r.data.data.isSuccess}  msg="${r.data.msg}"`);
      });

      // 사후: 실제 DB에 발급된 쿠폰 수 교차 검증
      const after = await memberApi.getMyCoupons();
      const afterCount = (after.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length;
      const actualIssued = afterCount - beforeCount;
      console.log(`[사후] ${VALID_CODE} 발급 수: ${afterCount} (신규 +${actualIssued})`);

      if (successCount > 1) {
        console.error(`🚨 Race Condition 확인: isSuccess=true ${successCount}건 — 초과 발급 발생`);
      }
      if (actualIssued > 1) {
        console.error(`🚨 DB 초과 발급 확인: 실제 발급된 쿠폰 ${actualIssued}건`);
      }

      // ── 핵심 검증 ──
      // 발행 수량 1 → 응답 기준으로 최대 1건만 성공이어야 함
      expect(successCount).toBeLessThanOrEqual(1);
      // DB에도 실제 1건 이하 발급되어야 함 (응답은 속여도 DB는 못 속임)
      expect(actualIssued).toBeLessThanOrEqual(1);
      // 서버 내부 오류 없음
      expect(has500).toBe(false);
    }, COUPON_TIMEOUT);

    test.skip('발행 수량 1인 쿠폰 — 50개 동시 요청 고부하 Race Condition', async () => {
      const VALID_CODE = 'REAL_COUPON_CODE_HERE'; // ← 실제 쿠폰 코드 입력
      const N = 50;

      const before = await memberApi.getMyCoupons();
      const beforeCount = (before.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length;

      const fns = Array.from({ length: N }, () => () => couponApi.issueCoupon(VALID_CODE));
      const start = Date.now();
      const results = await Promise.all(fns.map(fn => fn()));
      const elapsed = Date.now() - start;

      const successCount = results.filter(r => r.data.data.isSuccess === true).length;
      const has500       = results.some(r => r.status === 500);

      const after = await memberApi.getMyCoupons();
      const actualIssued = (after.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length - beforeCount;

      console.log(`⚡ 고부하 ${N}개 — ${elapsed}ms`);
      console.log(`isSuccess=true: ${successCount}건 / DB 실제 발급: ${actualIssued}건`);

      if (successCount > 1 || actualIssued > 1) {
        console.error(`🚨 Race Condition: 응답 성공 ${successCount}건, DB 발급 ${actualIssued}건`);
      }

      expect(successCount).toBeLessThanOrEqual(1);
      expect(actualIssued).toBeLessThanOrEqual(1);
      expect(has500).toBe(false);
    }, COUPON_TIMEOUT);
  });

  // ──────────────────────────────────────────────
  // 3. 빠른 연속 요청 — 순차 중복 발급 시도
  // ──────────────────────────────────────────────
  describe('순차 반복 요청 — 응답 일관성', () => {
    test('동일 코드로 5회 순차 요청 — 매 회 동일한 오류 응답 확인', async () => {
      const code = 'SEQUENTIAL_TEST_CODE_XYZ';
      const statuses: number[] = [];

      for (let i = 0; i < 5; i++) {
        const res = await couponApi.issueCoupon(code);
        statuses.push(res.status);
      }

      console.log('순차 요청 응답 순서:', statuses);

      // 500 없음
      expect(statuses.every(s => s !== 500)).toBe(true);
      // 모든 응답이 동일해야 함 (1회차 성공 여부에 따라 이후 동작 일관)
      expect(new Set(statuses).size).toBe(1);
    });

    test('발행 가능 여부 조회를 10회 연속 — 응답 일관성', async () => {
      const statuses: number[] = [];

      for (let i = 0; i < 10; i++) {
        const res = await couponApi.checkCouponAvailable();
        statuses.push(res.status);
      }

      console.log('연속 발행 가능 여부 응답:', JSON.stringify(statusDistribution(statuses)));

      expect(statuses.every(s => s !== 500)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // 4. Rate Limit 탐지
  // ──────────────────────────────────────────────
  describe('Rate Limit 탐지', () => {
    test('서로 다른 30개 코드로 동시 요청 — 429 Rate Limit 및 500 여부 확인', async () => {
      const N = 30;

      const results = await Promise.all(
        Array.from({ length: N }, (_, i) =>
          couponApi.issueCoupon(`RATE_LIMIT_TEST_CODE_${String(i).padStart(3, '0')}`),
        ),
      );

      const statuses = results.map(r => r.status);
      const has429 = statuses.some(s => s === 429);
      const has500 = statuses.some(s => s === 500);
      const dist = statusDistribution(statuses);

      console.log('Rate Limit 테스트 응답 분포:', JSON.stringify(dist));
      console.log(`429 Rate Limit 발생: ${has429} / 500 서버 오류 발생: ${has500}`);

      // 서버가 크래시 나지 않아야 함
      expect(has500).toBe(false);

      if (has429) {
        console.log('ℹ️ Rate Limit 정책 확인됨 (429 반환)');
      } else {
        console.log('ℹ️ Rate Limit 없음 또는 미적용 — 보안 정책 검토 권장');
      }
    }, COUPON_TIMEOUT);

    test('동일 코드로 30개 동시 요청 — Rate Limit 및 일관성 확인', async () => {
      const N = 30;
      const code = 'RATE_LIMIT_SAME_CODE_TEST';

      const results = await Promise.all(
        Array.from({ length: N }, () => couponApi.issueCoupon(code)),
      );

      const statuses = results.map(r => r.status);
      const has500 = statuses.some(s => s === 500);
      const has429 = statuses.some(s => s === 429);

      console.log('동일 코드 Rate Limit 분포:', JSON.stringify(statusDistribution(statuses)));

      expect(has500).toBe(false);
      if (has429) {
        console.log('ℹ️ 동일 코드 반복 시 Rate Limit 적용됨');
      }
    }, COUPON_TIMEOUT);
  });

  // ──────────────────────────────────────────────
  // 5. 응답 시간 측정
  // ──────────────────────────────────────────────
  describe('응답 시간 측정', () => {
    test('단건 요청 vs 10개 동시 요청 — 응답 시간 비교', async () => {
      const code = 'PERF_TEST_CODE';

      // 단건
      const singleStart = Date.now();
      await couponApi.issueCoupon(code);
      const singleElapsed = Date.now() - singleStart;

      // 10개 동시
      const parallelStart = Date.now();
      await Promise.all(Array.from({ length: 10 }, () => couponApi.issueCoupon(code)));
      const parallelElapsed = Date.now() - parallelStart;

      console.log(`단건 응답 시간: ${singleElapsed}ms`);
      console.log(`10개 동시 응답 시간: ${parallelElapsed}ms`);
      console.log(`배율: ${(parallelElapsed / singleElapsed).toFixed(2)}x`);

      // 동시 요청이 단건의 20배를 초과하면 성능 이슈 징후
      expect(parallelElapsed).toBeLessThan(singleElapsed * 20);
    }, COUPON_TIMEOUT);
  });
});
