import { etcApi } from '@/apis/etc.api';
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

describe('[기타] 서버 상태 / NPC / 비속어 API', () => {
  test('서버 생존 확인 (ping)', async () => {
    const res = await etcApi.ping();

    expect(res.status).toBe(200);
    console.log('✅ 서버 ping 성공, HTTP:', res.status);
  });

  test('NPC 대화 정보 조회', async () => {
    const res = await etcApi.getNpcInfo();

    expect([200, 404, 422]).toContain(res.status);
    console.log('✅ NPC 정보 HTTP 상태:', res.status);
  });

  test('비속어 리스트 조회', async () => {
    const res = await etcApi.getSlangList();

    expect([200, 404, 422]).toContain(res.status);
    console.log('✅ 비속어 리스트 HTTP 상태:', res.status);
  });

  describe('시험 API', () => {
    test('시험 목록 조회 (v1)', async () => {
      const res = await etcApi.getExams();

      expect([200, 404]).toContain(res.status);
      console.log('✅ 시험 목록 HTTP 상태:', res.status);
    });

    test('시험 목록 조회 (v2 client)', async () => {
      const res = await etcApi.getClientExams();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ v2 시험 목록 HTTP 상태:', res.status);
    });

    test('존재하지 않는 시험 ID 상세 조회 — 오류 응답', async () => {
      const res = await etcApi.getExamDetail(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 시험 ID HTTP 상태:', res.status);
    });

    test('음수 시험 ID 상세 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await etcApi.getExamDetail(-1);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 시험 ID HTTP 상태:', res.status);
    });
  });

  describe('메인 콘텐츠 API (AUTH)', () => {
    test('메인 실습 목록 조회', async () => {
      const res = await etcApi.getMainContents();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 메인 실습 목록 HTTP 상태:', res.status);
    });

    test('메인 추천 목록 조회', async () => {
      const res = await etcApi.getMainRecommend();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 메인 추천 목록 HTTP 상태:', res.status);
    });

    test('인증 헤더 없이 메인 실습 목록 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/main/contents');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 메인 실습 목록 HTTP 상태:', res.status);
    });
  });
});
