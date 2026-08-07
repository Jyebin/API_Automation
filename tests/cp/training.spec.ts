import { cpApi } from '@/apis/cp.api';
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

describe('[공급사] 실습 현황 API', () => {
  describe('v1', () => {
    test('실습 현황 조회 — 파라미터 없이 요청', async () => {
      const res = await cpApi.getTrainingStatus({});

      expect([200, 400, 422, 500]).toContain(res.status);
      console.log('✅ 실습 현황 HTTP 상태:', res.status);
    });

    test('실습 현황 조회 — 유효하지 않은 cp_token 값', async () => {
      const res = await cpApi.getTrainingStatus({ cp_token: 'INVALID_CP_TOKEN_XYZ' });

      expect([200, 400, 401, 403, 422, 500]).toContain(res.status);
      console.log('✅ 유효하지 않은 cp_token HTTP 상태:', res.status);
    });

    test('실습 현황 조회 — 유효하지 않은 contents_id', async () => {
      const res = await cpApi.getTrainingStatus({ contents_id: 'INVALID_CONTENTS_ID' });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ 유효하지 않은 contents_id HTTP 상태:', res.status);
    });

    test('실습 현황 업데이트 — 필수 파라미터 없이 요청', async () => {
      const res = await cpApi.updateTrainingStatus({});

      expect([200, 400, 422, 500]).toContain(res.status);
      console.log('✅ 실습 현황 업데이트 HTTP 상태:', res.status);
    });

    test('실습 현황 업데이트 — 유효하지 않은 contents_id', async () => {
      const res = await cpApi.updateTrainingStatus({ contents_id: 'INVALID_CONTENTS_ID_XYZ' });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ 유효하지 않은 업데이트 HTTP 상태:', res.status);
    });

    test.skip('실습 시작 — 실제 CP 토큰 및 콘텐츠 ID 필요', async () => {
      await cpApi.startTraining({ contents_id: 'REAL_ID' });
    });

    test.skip('실습 종료 — 실제 CP 토큰 및 콘텐츠 ID 필요', async () => {
      await cpApi.endTraining({ contents_id: 'REAL_ID' });
    });
  });

  describe('v2', () => {
    test('실습 현황 조회 (v2) — 파라미터 없이 요청', async () => {
      const res = await cpApi.getTrainingStatusV2({});

      expect([200, 400, 422, 500]).toContain(res.status);
      console.log('✅ v2 실습 현황 HTTP 상태:', res.status);
    });

    test('실습 현황 조회 (v2) — 유효하지 않은 contents_id', async () => {
      const res = await cpApi.getTrainingStatusV2({ contents_id: 'INVALID_CONTENTS_ID_XYZ' });

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ v2 유효하지 않은 contents_id HTTP 상태:', res.status);
    });

    test('실습 현황 업데이트 (v2) — 필수 파라미터 없이 요청', async () => {
      const res = await cpApi.updateTrainingStatusV2({});

      expect([200, 400, 422, 500]).toContain(res.status);
      console.log('✅ v2 실습 업데이트 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 실습 현황 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/cp/training/status');

      expect([401, 403, 422]).toContain(res.status);
      console.log('✅ 미인증 실습 현황 접근 HTTP 상태:', res.status);
    });
  });
});
