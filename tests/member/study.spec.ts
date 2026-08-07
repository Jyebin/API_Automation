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

describe('[회원] 학습 현황 API', () => {
  let firstClassCode: string | undefined;

  describe('v1', () => {
    test('내 학습 현황 목록 조회', async () => {
      const res = await memberApi.getMyStudyClasses({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      firstClassCode = res.data.content?.[0]?.code;
      console.log('✅ 학습 중인 수업 수:', res.data.content?.length);
    });

    test('학습 현황 상세 조회 — 목록에서 첫 번째 수업 코드 사용', async () => {
      if (!firstClassCode) {
        console.log('ℹ️ 수강 중인 수업 없음, 건너뜀');
        return;
      }

      const res = await memberApi.getMyStudyClassDetail(firstClassCode);

      expect(res.status).toBe(200);
      console.log('✅ 수업 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 수업 코드 조회 — 오류 응답', async () => {
      const res = await memberApi.getMyStudyClassDetail('INVALID_CLASS_CODE');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 수업 코드 HTTP 상태:', res.status);
    });

    test('빈 수업 코드 조회 — 오류 응답', async () => {
      const res = await memberApi.getMyStudyClassDetail('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 수업 코드 HTTP 상태:', res.status);
    });

    test('특수문자 수업 코드 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await memberApi.getMyStudyClassDetail("'; DROP TABLE class; --");

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ SQL Injection 수업 코드 HTTP 상태:', res.status);
    });

    test('내 배지 즐겨찾기 목록 조회', async () => {
      const res = await memberApi.getMyBadgeFavorites();

      expect(res.status).toBe(200);
      console.log('✅ 배지 즐겨찾기 HTTP 상태:', res.status);
    });

    test('토큰 유효기간 확인', async () => {
      const res = await memberApi.getTokenValidity();

      expect(res.status).toBe(200);
      console.log('✅ 토큰 유효기간 HTTP 상태:', res.status);
    });
  });

  describe('v1 — 페이지네이션 경계값', () => {
    test('page=0 학습 현황 조회', async () => {
      const res = await memberApi.getMyStudyClasses({ page: 0, size: 10 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ page=0 학습 현황 HTTP 상태:', res.status);
    });

    test('size=0 학습 현황 조회', async () => {
      const res = await memberApi.getMyStudyClasses({ page: 1, size: 0 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ size=0 학습 현황 HTTP 상태:', res.status);
    });

    test('매우 큰 page 번호 학습 현황 조회', async () => {
      const res = await memberApi.getMyStudyClasses({ page: 999999, size: 10 });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ page=999999 학습 현황 HTTP 상태:', res.status);
    });
  });

  describe('v2', () => {
    test('내 학습 현황 목록 조회 (v2)', async () => {
      const res = await memberApi.getMyStudyClassesV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 학습 현황 HTTP 상태:', res.status);
    });

    test('내 배지 즐겨찾기 목록 조회 (v2)', async () => {
      const res = await memberApi.getMyBadgeFavoritesV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 배지 즐겨찾기 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 학습 현황 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/member/my/study/classes');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 학습 현황 접근 HTTP 상태:', res.status);
    });
  });
});
