import apiClient from '@/client/apiClient';

export const clientApi = {
  // ── 실습관 빌딩 (v2, AUTH) ─────────────────────────────────────────────
  getBuildings: () =>
    apiClient.get('/api/v2/client/contents/building'),

  getBuildingFloors: (id: number | string) =>
    apiClient.get(`/api/v2/client/contents/building/${id}/floor`),

  getBuildingFloorInfo: (id: number | string, floorNum: number | string) =>
    apiClient.get(`/api/v2/client/contents/building/${id}/floor/${floorNum}/info`),

  // ── 구매 콘텐츠 / 단축키 (v2, AUTH) ──────────────────────────────────
  getPurchasedContentsInfo: () =>
    apiClient.get('/api/v2/client/contents/purchased/info'),

  getShortcutContentsInfo: () =>
    apiClient.get('/api/v2/client/contents/shortcut/info'),
};
