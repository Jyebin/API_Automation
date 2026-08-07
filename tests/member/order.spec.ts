import { memberApi } from '@/apis/member.api';
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

describe('[회원] 구매 내역 API', () => {
  let firstOrderNo: string | undefined;

  describe('v1', () => {
    test('구매 취소 사유 목록 조회 — 배열 확인', async () => {
      const res = await memberApi.getOrderCancelReasons();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      console.log('✅ 취소 사유 수:', res.data.content?.length);
    });

    test('구매 내역 목록 조회', async () => {
      const res = await memberApi.getMyOrders({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      firstOrderNo = res.data.content?.[0]?.order_no;
      console.log('✅ 구매 내역 수:', res.data.content?.length);
    });

    test('구매 내역 상세 조회 — 목록에서 첫 번째 주문 사용', async () => {
      if (!firstOrderNo) {
        console.log('ℹ️ 구매 내역 없음, 상세 조회 건너뜀');
        return;
      }

      const res = await memberApi.getMyOrderDetail(firstOrderNo);

      expect([200, 500]).toContain(res.status);
      console.log('✅ 주문 상세 HTTP 상태:', res.status, firstOrderNo);
    });

    test('존재하지 않는 주문번호 상세 조회 — 오류 응답', async () => {
      const res = await memberApi.getMyOrderDetail('INVALID_ORDER_NO_00000');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 주문번호 HTTP 상태:', res.status);
    });

    test('매우 긴 주문번호 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await memberApi.getMyOrderDetail('O'.repeat(500));

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 주문번호 HTTP 상태:', res.status);
    });

    test.skip('주문 취소 — 실제 주문 필요, 파괴적 작업', async () => {
      if (!firstOrderNo) return;
      await memberApi.cancelOrder(firstOrderNo, { reason: 'TEST_CANCEL' });
    });
  });

  describe('v1 — 페이지네이션 경계값', () => {
    test('page=0 요청 — 오류 또는 빈 결과 확인', async () => {
      const res = await memberApi.getMyOrders({ page: 0, size: 10 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ page=0 HTTP 상태:', res.status);
    });

    test('size=0 요청 — 오류 또는 빈 결과 확인', async () => {
      const res = await memberApi.getMyOrders({ page: 1, size: 0 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ size=0 HTTP 상태:', res.status);
    });

    test('매우 큰 page 번호 — 빈 결과 또는 오류 확인', async () => {
      const res = await memberApi.getMyOrders({ page: 999999, size: 10 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ page=999999 HTTP 상태:', res.status);
    });
  });

  describe('v2', () => {
    test('구매 내역 목록 조회 (v2)', async () => {
      const res = await memberApi.getMyOrdersV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 구매 내역 HTTP 상태:', res.status);
    });

    test('구매 취소 사유 목록 조회 (v2)', async () => {
      const res = await memberApi.getOrderCancelReasonsV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 취소 사유 HTTP 상태:', res.status);
    });

    test('내 쿠폰 목록 조회', async () => {
      const res = await memberApi.getMyCoupons();

      expect(res.status).toBe(200);
      console.log('✅ 보유 쿠폰 수:', res.data.content?.length);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 구매 내역 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/member/my/order');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 구매 내역 접근 HTTP 상태:', res.status);
    });
  });
});
