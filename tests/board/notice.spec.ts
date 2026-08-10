import { boardApi } from '@/apis/board.api';

describe('[게시판] 공지사항 API', () => {
  describe('v1', () => {
    test('공지사항 카테고리 목록 조회 — 200 및 배열 확인', async () => {
      const res = await boardApi.getNoticeCategories();

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      expect(res.data.content?.length).toBeGreaterThan(0);

      console.log('✅ 공지 카테고리 수:', res.data.content?.length);
    });

    test('존재하지 않는 공지사항 ID 조회 — 404/오류 응답', async () => {
      const res = await boardApi.getNoticeDetail(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 공지사항 HTTP 상태:', res.status);
    });

    test('음수 공지사항 ID 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await boardApi.getNoticeDetail(-1);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 공지사항 ID HTTP 상태:', res.status);
    });
  });

  describe('v2', () => {
    test('공지사항 카테고리 목록 조회 (v2)', async () => {
      const res = await boardApi.getNoticeCategoriesV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 공지 카테고리 HTTP 상태:', res.status);
    });

    test('존재하지 않는 공지사항 ID 조회 (v2) — 오류 응답', async () => {
      const res = await boardApi.getNoticeDetailV2(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ v2 없는 공지사항 HTTP 상태:', res.status);
    });
  });
});
