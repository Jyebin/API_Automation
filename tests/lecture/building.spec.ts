import { lectureApi } from '@/apis/lecture.api';
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

describe('[강의] 강의동 API', () => {
  let firstBuildingId: string | undefined;
  let firstFloorId: string | undefined;

  describe('v1 (AUTH)', () => {
    test('강의동 목록 조회 — 200 및 배열 확인', async () => {
      const res = await lectureApi.getBuildings();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      firstBuildingId = res.data.content?.[0]?.id;
      console.log('✅ 강의동 수:', res.data.content?.length);
    });

    test('강의동 상세 조회 — 첫 번째 강의동 ID 사용', async () => {
      if (!firstBuildingId) {
        console.log('ℹ️ 강의동 없음, 건너뜀');
        return;
      }

      const res = await lectureApi.getBuildingDetail(firstBuildingId);

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(res.data.content?.id).toBe(firstBuildingId);
      expect(res.data.content?.floor).toBeDefined();

      firstFloorId = res.data.content?.floor?.[0]?.id;
      console.log('✅ 강의동 상세:', res.data.content?.name, '/ 층 수:', res.data.content?.floor_cnt);
    });

    test('층 상세 조회 — 첫 번째 강의동/층 ID 사용', async () => {
      if (!firstBuildingId || !firstFloorId) {
        console.log('ℹ️ 강의동 또는 층 없음, 건너뜀');
        return;
      }

      const res = await lectureApi.getBuildingFloor(firstBuildingId, firstFloorId);

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);

      console.log('✅ 층 상세 조회 성공');
    });

    test('존재하지 않는 강의동 ID 조회 — 오류 응답', async () => {
      const res = await lectureApi.getBuildingDetail('INVALID_BUILDING_ID');

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 없는 강의동 ID 응답:', res.data.msg);
    });

    test('매우 긴 강의동 ID 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await lectureApi.getBuildingDetail('X'.repeat(500));

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 강의동 ID HTTP 상태:', res.status);
    });

    test('존재하지 않는 강의동 ID의 층 조회 — 오류 응답', async () => {
      const res = await lectureApi.getBuildingFloor('INVALID_BUILDING_ID', 'INVALID_FLOOR_ID');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 강의동/층 ID HTTP 상태:', res.status);
    });

    test('유효한 강의동 ID + 존재하지 않는 층 ID — 오류 응답', async () => {
      if (!firstBuildingId) {
        console.log('ℹ️ 강의동 없음, 건너뜀');
        return;
      }

      const res = await lectureApi.getBuildingFloor(firstBuildingId, 'INVALID_FLOOR_ID_99999');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 층 ID HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 강의동 목록 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/lecture/building');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 강의동 접근 HTTP 상태:', res.status);
    });
  });
});
