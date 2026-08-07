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

describe('[WebView] 대시보드 API', () => {
  describe('v1 (AUTH)', () => {
    test('학습 현황 요약 조회', async () => {
      const res = await viewApi.getStudySummary();

      expect(res.status).toBe(200);
      console.log('✅ 학습 현황 HTTP 상태:', res.status);
    });

    test('학습 현황 요약 조회 — 유효하지 않은 파라미터 (서버가 무시해야 함)', async () => {
      const res = await viewApi.getStudySummary({ invalid_param: 'xyz' } as Record<string, string>);

      expect(res.status).toBe(200);
      console.log('✅ 유효하지 않은 파라미터 학습 현황 HTTP 상태:', res.status);
    });

    test('실습 캘린더 조회', async () => {
      const res = await viewApi.getCalendar();

      expect(res.status).toBe(200);
      console.log('✅ 캘린더 HTTP 상태:', res.status);
    });

    test('실습 캘린더 조회 — 유효한 연월 파라미터', async () => {
      const res = await viewApi.getCalendar({ year: '2025', month: '01' });

      expect(res.status).toBe(200);
      console.log('✅ 연월 파라미터 캘린더 HTTP 상태:', res.status);
    });

    test('실습 캘린더 조회 — 유효하지 않은 연월 (월=99) — 오류 또는 빈 결과', async () => {
      const res = await viewApi.getCalendar({ year: '2025', month: '99' });

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ 잘못된 연월 캘린더 HTTP 상태:', res.status);
    });

    test('실습 캘린더 조회 — 과거 날짜 (2020년) — 빈 결과 또는 200', async () => {
      const res = await viewApi.getCalendar({ year: '2020', month: '01' });

      expect(res.status).toBe(200);

      const content = res.data.content;
      console.log('✅ 과거 날짜 캘린더 결과:', Array.isArray(content) ? content.length : '단건');
    });

    test('마이페이지 실습 캘린더 조회', async () => {
      const res = await viewApi.getMyCalendar();

      expect(res.status).toBe(200);
      console.log('✅ 마이페이지 캘린더 HTTP 상태:', res.status);
    });
  });

  describe('v2 (AUTH)', () => {
    test('학습 현황 요약 조회 (v2)', async () => {
      const res = await viewApi.getStudySummaryV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 학습 현황 HTTP 상태:', res.status);
    });

    test('실습 캘린더 조회 (v2)', async () => {
      const res = await viewApi.getCalendarV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 캘린더 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 학습 현황 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/view/dashboard/study');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 학습 현황 접근 HTTP 상태:', res.status);
    });
  });
});
