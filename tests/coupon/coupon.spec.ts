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
    test('쿠폰 발행 가능 여부 조회', async () => {
      const res = await couponApi.checkCouponAvailable();

      expect(res.status).toBe(200);
      console.log('✅ 쿠폰 발행 가능 여부 HTTP 상태:', res.status);
    });
  });

  describe('AUTH — 쿠폰 발행 (다양한 입력 검증)', () => {
    test('유효하지 않은 쿠폰 코드 발행 — 오류 응답 확인', async () => {
      const res = await couponApi.issueCoupon('INVALID_COUPON_CODE_TEST');

      expect(res.status).not.toBe(200);
      console.log('✅ 유효하지 않은 쿠폰 HTTP 상태:', res.status);
    });

    test('빈 쿠폰 코드 발행 — 오류 응답 확인', async () => {
      const res = await couponApi.issueCoupon('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 쿠폰 코드 HTTP 상태:', res.status);
    });

    test('공백만 있는 쿠폰 코드 발행 — 오류 응답 확인', async () => {
      const res = await couponApi.issueCoupon('   ');

      expect(res.status).not.toBe(200);
      console.log('✅ 공백 쿠폰 코드 HTTP 상태:', res.status);
    });

    test('특수문자 쿠폰 코드 발행 — 서버 오류 없이 거부 확인', async () => {
      const res = await couponApi.issueCoupon("'; DROP TABLE coupon; --");

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ SQL Injection 쿠폰 코드 HTTP 상태:', res.status);
    });

    test('매우 긴 쿠폰 코드 (500자) 발행 — 서버 오류 없이 거부 확인', async () => {
      const res = await couponApi.issueCoupon('C'.repeat(500));

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 쿠폰 코드 HTTP 상태:', res.status);
    });

    test('숫자로만 구성된 쿠폰 코드 — 오류 응답 확인', async () => {
      const res = await couponApi.issueCoupon('123456789012');

      expect(res.status).not.toBe(200);
      console.log('✅ 숫자만 쿠폰 코드 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 쿠폰 발행 — 401/403 응답 확인', async () => {
      const res = await anonClient.post('/api/v1/coupon/issue', { coupon_code: 'TEST' });

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 쿠폰 발행 HTTP 상태:', res.status);
    });
  });
});
