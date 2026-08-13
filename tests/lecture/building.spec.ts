import { clientApi } from '@/apis/client.api';

describe('[실습관] 빌딩 / 콘텐츠 API', () => {
  let firstBuildingId: number | string | null = null;
  let firstFloorNum: number | string | null = null;

  describe('빌딩 목록 (v2, AUTH)', () => {
    test('빌딩 목록 조회 — HTTP 상태 확인', async () => {
      const res = await clientApi.getBuildings();

      expect([200, 204, 422]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.data?.content) && res.data.content.length > 0) {
        firstBuildingId = res.data.content[0].id ?? res.data.content[0].building_id ?? null;
      }
      console.log('✅ 빌딩 목록 HTTP 상태:', res.status);
    });

    test('빌딩 층 목록 조회 — 첫 번째 빌딩 ID 사용', async () => {
      if (!firstBuildingId) {
        console.log('ℹ️ 빌딩 없음, 고정 ID로 시도');
        firstBuildingId = 1;
      }
      const res = await clientApi.getBuildingFloors(firstBuildingId);

      expect([200, 204, 404, 422]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.data?.content) && res.data.content.length > 0) {
        firstFloorNum = res.data.content[0].floor_num ?? res.data.content[0].floor ?? 1;
      }
      console.log('✅ 빌딩 층 목록 HTTP 상태:', res.status);
    });

    test('빌딩 층 상세 정보 조회', async () => {
      const buildingId = firstBuildingId ?? 1;
      const floorNum = firstFloorNum ?? 1;
      const res = await clientApi.getBuildingFloorInfo(buildingId, floorNum);

      expect([200, 204, 404, 422]).toContain(res.status);
      console.log('✅ 빌딩 층 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 빌딩 ID — 오류 응답', async () => {
      const res = await clientApi.getBuildingFloors(999999999);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 없는 빌딩 ID HTTP 상태:', res.status);
    });

    test('음수 빌딩 ID — 서버 오류 없이 거부 확인', async () => {
      const res = await clientApi.getBuildingFloors(-1);

      expect(res.status).not.toBe(500);
      console.log('✅ 음수 빌딩 ID HTTP 상태:', res.status);
    });
  });

  describe('구매 콘텐츠 / 단축키 (v2, AUTH)', () => {
    test('구매한 콘텐츠 정보 조회', async () => {
      const res = await clientApi.getPurchasedContentsInfo();

      expect([200, 204, 422]).toContain(res.status);
      console.log('✅ 구매 콘텐츠 정보 HTTP 상태:', res.status);
    });

    test('단축키 콘텐츠 정보 조회', async () => {
      const res = await clientApi.getShortcutContentsInfo();

      expect([200, 204, 422]).toContain(res.status);
      console.log('✅ 단축키 콘텐츠 정보 HTTP 상태:', res.status);
    });
  });
});
