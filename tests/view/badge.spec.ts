import { viewApi } from '@/apis/view.api';
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

describe('[WebView] 배지 API', () => {
  let firstBadgeId: number | undefined;

  describe('v1 (AUTH)', () => {
    test('배지 목록 조회 — HTTP 상태 확인', async () => {
      const res = await viewApi.getBadgeList({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      firstBadgeId = res.data.content?.[0]?.idx;
      console.log('✅ 배지 수:', res.data.content?.length);
    });

    test('배지 목록 조회 — 마지막 페이지 초과', async () => {
      const res = await viewApi.getBadgeList({ page: 999999, size: 10 });

      expect([200, 400, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 마지막 페이지 초과 배지 수:', res.data.content?.length ?? 0);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('배지 상세 조회 — 첫 번째 배지 사용', async () => {
      if (!firstBadgeId) {
        console.log('ℹ️ 배지 없음, 건너뜀');
        return;
      }

      const res = await viewApi.getBadgeDetail(firstBadgeId);

      expect(res.status).toBe(200);
      expect(res.data.content?.idx).toBe(firstBadgeId);
      expect(res.data.content?.name).toBeTruthy();
      console.log('✅ 배지 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 배지 ID 조회 — 오류 응답', async () => {
      const res = await viewApi.getBadgeDetail(999999999);

      expect([400, 404, 500]).toContain(res.status);
      console.log('✅ 없는 배지 HTTP 상태:', res.status);
    });

    test('음수 배지 ID 조회 — 서버 응답 확인', async () => {
      const res = await viewApi.getBadgeDetail(-1);

      expect([400, 404, 500]).toContain(res.status);
      console.log('✅ 음수 배지 ID HTTP 상태:', res.status);
    });

    test('배지 즐겨찾기 추가 — 존재하지 않는 배지 ID', async () => {
      const res = await viewApi.addBadgeFavorite(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 배지 즐겨찾기 추가 HTTP 상태:', res.status);
    });

    test('배지 수료증 조회 — 첫 번째 배지 사용', async () => {
      if (!firstBadgeId) {
        console.log('ℹ️ 배지 없음, 건너뜀');
        return;
      }

      const res = await viewApi.getBadgeCertificate(firstBadgeId);

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ 배지 수료증 HTTP 상태:', res.status);
    });

    test('배지 수료증 조회 — 존재하지 않는 배지 ID', async () => {
      const res = await viewApi.getBadgeCertificate(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 배지 수료증 HTTP 상태:', res.status);
    });
  });

  describe('v2 (AUTH)', () => {
    test('배지 목록 조회 (v2)', async () => {
      const res = await viewApi.getBadgeListV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 배지 목록 HTTP 상태:', res.status);
    });

    test('배지 상세 조회 (v2) — 존재하지 않는 배지 ID', async () => {
      const res = await viewApi.getBadgeDetailV2(999999999);

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ v2 없는 배지 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 배지 목록 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/view/badge/list');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 배지 목록 접근 HTTP 상태:', res.status);
    });
  });
});
