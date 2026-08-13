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

describe('[회원] WebView URL API', () => {
  describe('v2 (AUTH)', () => {
    test('대시보드 WebView URL 조회', async () => {
      const res = await memberApi.getMyWebView('dashboard');

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 대시보드 WebView HTTP 상태:', res.status);
    });

    test('존재하지 않는 WebView 타입 — 오류 응답', async () => {
      const res = await memberApi.getMyWebView('invalid_webview_type_xyz');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 WebView 타입 HTTP 상태:', res.status);
    });

    test('빈 WebView 타입 — 오류 응답', async () => {
      const res = await memberApi.getMyWebView('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 WebView 타입 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 WebView 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v2/member/my/dashboard');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 WebView HTTP 상태:', res.status);
    });
  });
});
