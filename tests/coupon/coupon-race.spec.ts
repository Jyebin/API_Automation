/**
 * 쿠폰 Race Condition 테스트 — worker_threads 기반 진짜 동시 발사
 *
 * Promise.all()은 Node.js 싱글 스레드 특성상 요청이 수 마이크로초씩 순서대로 나감.
 * worker_threads를 쓰면 각 스레드가 독립적으로 동시에 TCP 연결을 맺고 요청을 보냄.
 *
 * 테스트 흐름:
 *   1. N개 워커 스레드를 미리 생성 (ready 상태로 대기)
 *   2. 메인 스레드가 "GO" 신호를 동시에 broadcast
 *   3. 모든 워커가 같은 신호를 받는 즉시 각자 독립적으로 HTTP 요청 발사
 *   4. 결과 수집 → isSuccess=true 건수 + DB 교차 검증
 *
 * 활성화:
 *   1. admin에서 발행 수량=1 쿠폰 코드 생성
 *   2. RACE_COUPON_CODE 환경변수 또는 아래 상수에 코드 입력
 *   3. test.skip → test 변경
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';
import { memberApi } from '@/apis/member.api';

// ── 워커 스레드 코드 (같은 파일 내에서 분기) ──────────────────
if (!isMainThread) {
  const { baseUrl, token, couponCode, workerId } = workerData as {
    baseUrl: string;
    token: string;
    couponCode: string;
    workerId: number;
  };

  // GO 신호를 받으면 즉시 요청 발사
  parentPort!.once('message', async (msg: string) => {
    if (msg !== 'GO') return;

    const start = Date.now();
    try {
      const res = await axios.post(
        `${baseUrl}/api/v2/coupon/issue`,
        null,
        {
          params: { coupon_code: couponCode },
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          validateStatus: () => true,
          timeout: 30_000,
        },
      );
      parentPort!.postMessage({
        workerId,
        elapsed: Date.now() - start,
        httpStatus: res.status,
        isSuccess: res.data?.data?.isSuccess ?? null,
        msg: res.data?.msg ?? '',
        errorCode: res.data?.data?.code ?? '',
      });
    } catch (err) {
      parentPort!.postMessage({
        workerId,
        elapsed: Date.now() - start,
        httpStatus: 0,
        isSuccess: false,
        msg: String(err),
        errorCode: 'NETWORK_ERROR',
      });
    }
  });
}

// ── 메인 스레드: 테스트 본문 ──────────────────────────────────
if (isMainThread) {
  type WorkerResult = {
    workerId: number;
    elapsed: number;
    httpStatus: number;
    isSuccess: boolean | null;
    msg: string;
    errorCode: string;
  };

  function fireAllAtOnce(
    n: number,
    couponCode: string,
    baseUrl: string,
    token: string,
  ): Promise<WorkerResult[]> {
    return new Promise((resolve, reject) => {
      const results: WorkerResult[] = [];
      const workers: Worker[] = [];
      let ready = 0;

      for (let i = 0; i < n; i++) {
        const w = new Worker(__filename, {
          workerData: { baseUrl, token, couponCode, workerId: i },
        });

        w.once('message', (result: WorkerResult) => {
          results.push(result);
          if (results.length === n) resolve(results);
        });

        w.once('error', reject);

        workers.push(w);
        ready++;

        // 모든 워커가 생성되면 동시에 GO 신호 발송
        if (ready === n) {
          // 모든 워커가 'message' 리스너를 달 시간을 줌 (1 tick)
          setImmediate(() => {
            const fireTime = Date.now();
            console.log(`  🚀 GO 신호 발송 — ${new Date(fireTime).toISOString()}`);
            workers.forEach(wk => wk.postMessage('GO'));
          });
        }
      }
    });
  }

  const TIMEOUT = 60_000;

  describe('[쿠폰] Race Condition — worker_threads 동시 발사', () => {
    // ──────────────────────────────────────────────────────────
    // 발행 수량 1인 쿠폰: 10개 스레드 동시 발사
    // ──────────────────────────────────────────────────────────
    test.skip('발행 수량 1 — 10 스레드 동시 요청, isSuccess=true 최대 1건', async () => {
      const VALID_CODE = process.env.RACE_COUPON_CODE ?? 'REAL_COUPON_CODE_HERE';
      const N = 10;
      const baseUrl = process.env.API_BASE_URL ?? '';
      const token   = process.env.__ACCESS_TOKEN__ ?? '';

      // 사전: 현재 발급 수 스냅샷
      const before = await memberApi.getMyCoupons();
      const beforeCount = (before.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length;
      console.log(`[사전] 발급 수: ${beforeCount}`);

      // 동시 발사
      const results = await fireAllAtOnce(N, VALID_CODE, baseUrl, token);

      // 응답 정렬 (워커 ID 순)
      results.sort((a, b) => a.workerId - b.workerId);

      const successCount = results.filter(r => r.isSuccess === true).length;
      const failCount    = results.filter(r => r.isSuccess === false).length;
      const minElapsed   = Math.min(...results.map(r => r.elapsed));
      const maxElapsed   = Math.max(...results.map(r => r.elapsed));

      console.log(`\n  결과 (${N}개 스레드):`);
      results.forEach(r => {
        const mark = r.isSuccess ? '✅' : '❌';
        console.log(
          `  ${mark} worker[${r.workerId}]  isSuccess=${r.isSuccess}` +
          `  ${r.elapsed}ms  "${r.msg}"`,
        );
      });
      console.log(`\n  isSuccess=true: ${successCount}건 / false: ${failCount}건`);
      console.log(`  응답 시간 범위: ${minElapsed}ms ~ ${maxElapsed}ms`);

      // 사후: DB 교차 검증
      const after = await memberApi.getMyCoupons();
      const actualIssued = (after.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length - beforeCount;
      console.log(`[사후] 실제 DB 발급 수: +${actualIssued}`);

      if (successCount > 1) {
        console.error(`🚨 Race Condition: isSuccess=true ${successCount}건 — 초과 발급`);
      }
      if (actualIssued > 1) {
        console.error(`🚨 DB 초과 발급: ${actualIssued}건 (발행 수량 1 초과)`);
      }

      expect(successCount).toBeLessThanOrEqual(1);
      expect(actualIssued).toBeLessThanOrEqual(1);
    }, TIMEOUT);

    // ──────────────────────────────────────────────────────────
    // 발행 수량 1인 쿠폰: 50개 스레드 고부하
    // ──────────────────────────────────────────────────────────
    test.skip('발행 수량 1 — 50 스레드 고부하 Race Condition', async () => {
      const VALID_CODE = process.env.RACE_COUPON_CODE ?? 'REAL_COUPON_CODE_HERE';
      const N = 50;
      const baseUrl = process.env.API_BASE_URL ?? '';
      const token   = process.env.__ACCESS_TOKEN__ ?? '';

      const before = await memberApi.getMyCoupons();
      const beforeCount = (before.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length;

      const results = await fireAllAtOnce(N, VALID_CODE, baseUrl, token);

      const successCount = results.filter(r => r.isSuccess === true).length;
      const afterRes = await memberApi.getMyCoupons();
      const actualIssued = (afterRes.data?.content ?? []).filter(
        (c: { code?: string }) => c.code === VALID_CODE,
      ).length - beforeCount;

      console.log(`  고부하 ${N}스레드 — isSuccess=true: ${successCount}건, DB 발급: ${actualIssued}건`);

      if (successCount > 1 || actualIssued > 1) {
        console.error(`🚨 Race Condition 확인: 응답 ${successCount}건, DB ${actualIssued}건`);
      }

      expect(successCount).toBeLessThanOrEqual(1);
      expect(actualIssued).toBeLessThanOrEqual(1);
    }, TIMEOUT);
  });
}
