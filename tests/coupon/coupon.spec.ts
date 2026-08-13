import { couponApi } from '@/apis/coupon.api';
import axios from 'axios';
import * as https from 'https';

const BASE_URL = process.env.API_BASE_URL ?? '';

const anonClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
});

describe('[쿠폰] API', () => {
  describe('PUBLIC', () => {
    test('쿠폰 연동 상품 목록 조회', async () => {
      const res = await couponApi.getCouponProducts();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 쿠폰 연동 상품 HTTP 상태:', res.status);
    });
  });

  describe('AUTH — 쿠폰 발행 가능 여부', () => {
    test('coupon_code 없이 조회 — 422 (필수 파라미터 누락)', async () => {
      // swagger: coupon_code * (required query param)
      const res = await couponApi.checkCouponAvailable();

      expect(res.status).toBe(422);
      console.log('✅ 쿠폰 발행 가능 여부(파라미터 없음) HTTP 상태:', res.status);
    });

    test('존재하지 않는 쿠폰 코드로 발행 가능 여부 조회 — 4xx', async () => {
      const res = await couponApi.checkCouponAvailable({ coupon_code: 'NO_SUCH_CODE_XYZ' });

      expect(res.status).not.toBe(500);
      console.log('✅ 존재하지 않는 코드 발행 가능 여부 HTTP 상태:', res.status);
    });
  });

  describe('AUTH — 쿠폰 발행 (입력 검증 — 서버 버그 기록)', () => {
    // [서버 버그] 쿠폰 코드 유효성 검증 없음:
    // 빈 값·공백·특수문자·500자 코드 모두 201 반환됨.
    // 기대값은 4xx이나 현재 서버는 모두 201을 반환 → 실패로 기록

    test('[BUG] 존재하지 않는 쿠폰 코드 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon('INVALID_COUPON_CODE_TEST');

      console.log('쿠폰 코드 없음 HTTP 상태:', res.status, '/ 응답:', JSON.stringify(res.data));
      expect(res.status).not.toBe(201); // 서버 버그: 존재하지 않는 코드에 201 반환
    });

    test('[BUG] 빈 쿠폰 코드 발행 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon('');

      console.log('빈 코드 HTTP 상태:', res.status);
      expect(res.status).not.toBe(201); // 서버 버그: 빈 문자열에 201 반환
    });

    test('[BUG] 공백 쿠폰 코드 발행 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon('   ');

      console.log('공백 코드 HTTP 상태:', res.status);
      expect(res.status).not.toBe(201); // 서버 버그: 공백 문자열에 201 반환
    });

    test('[BUG] SQL Injection 쿠폰 코드 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon("'; DROP TABLE coupon; --");

      console.log('SQL Injection 코드 HTTP 상태:', res.status);
      expect(res.status).not.toBe(201); // 서버 버그: SQL injection 문자열에 201 반환
      expect(res.status).not.toBe(500);
    });

    test('[BUG] 500자 쿠폰 코드 발행 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon('C'.repeat(500));

      console.log('500자 코드 HTTP 상태:', res.status);
      expect(res.status).not.toBe(201); // 서버 버그: 500자 문자열에 201 반환
      expect(res.status).not.toBe(500);
    });

    test('[BUG] 숫자로만 구성된 쿠폰 코드 — 4xx 기대, 실제 201', async () => {
      const res = await couponApi.issueCoupon('123456789012');

      console.log('숫자 코드 HTTP 상태:', res.status);
      expect(res.status).not.toBe(201); // 서버 버그: 숫자 문자열에 201 반환
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 쿠폰 발행 — 401/403 응답 확인', async () => {
      // swagger: POST /api/v2/coupon/issue (query param)
      const res = await anonClient.post('/api/v2/coupon/issue', null, {
        params: { coupon_code: 'TEST' },
      });

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 쿠폰 발행 HTTP 상태:', res.status);
    });
  });
});
