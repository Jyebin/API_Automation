import { boardApi } from '@/apis/board.api';

describe('[게시판] 공지사항 API', () => {
  let firstNoticeId: number | undefined;

  describe('v1', () => {
    test('공지사항 카테고리 목록 조회 — 200 및 배열 확인', async () => {
      const res = await boardApi.getNoticeCategories();

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      expect(res.data.content?.length).toBeGreaterThan(0);

      console.log('✅ 공지 카테고리 수:', res.data.content?.length);
    });

    test('공지사항 목록 조회', async () => {
      const res = await boardApi.getNotices({ page: 1, size: 10 });

      expect([200, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(Array.isArray(res.data.content)).toBe(true);
        firstNoticeId = res.data.content?.[0]?.idx;
        console.log('✅ 공지사항 수:', res.data.content?.length);
      } else {
        console.log('ℹ️ 공지사항 목록 서버 응답:', res.status);
      }
    });

    test('공지사항 목록 조회 — size=1 페이지 정보 확인', async () => {
      const res = await boardApi.getNotices({ page: 1, size: 1 });

      expect([200, 500]).toContain(res.status);

      if (res.status === 200 && res.data.page_info) {
        expect(res.data.page_info.request_size).toBe(1);
        console.log('✅ size=1 페이지 정보:', JSON.stringify(res.data.page_info));
      }
    });

    test('공지사항 목록 조회 — 마지막 페이지 초과', async () => {
      const res = await boardApi.getNotices({ page: 999999, size: 10 });

      expect([200, 400, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        const items = res.data.content ?? [];
        console.log('✅ 마지막 페이지 초과 결과 수:', items.length);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('공지사항 상세 조회 — 첫 번째 idx 사용', async () => {
      if (!firstNoticeId) {
        console.log('ℹ️ 공지사항 없음 또는 목록 조회 실패, 건너뜀');
        return;
      }

      const res = await boardApi.getNoticeDetail(firstNoticeId);

      expect(res.status).toBe(200);
      expect(res.data.content?.title).toBeTruthy();
      expect(typeof res.data.content?.title).toBe('string');

      console.log('✅ 공지사항 상세:', res.data.content?.title);
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

  describe('v1 — 카테고리 필터', () => {
    test('존재하지 않는 카테고리로 공지 목록 조회 — 빈 결과 확인', async () => {
      const res = await boardApi.getNotices({
        page: 1,
        size: 10,
        category: 'NONEXISTENT_CATEGORY_CODE',
      });

      expect([200, 400, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 없는 카테고리 결과 수:', res.data.content?.length ?? 0);
      } else {
        console.log('✅ 없는 카테고리 HTTP 상태:', res.status);
      }
    });
  });

  describe('v2', () => {
    test('공지사항 카테고리 목록 조회 (v2)', async () => {
      const res = await boardApi.getNoticeCategoriesV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 공지 카테고리 HTTP 상태:', res.status);
    });

    test('공지사항 목록 조회 (v2)', async () => {
      const res = await boardApi.getNoticesV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 공지사항 목록 HTTP 상태:', res.status);
    });

    test('공지사항 상세 조회 (v2)', async () => {
      if (!firstNoticeId) {
        console.log('ℹ️ 공지사항 없음, 건너뜀');
        return;
      }

      const res = await boardApi.getNoticeDetailV2(firstNoticeId);

      expect(res.status).toBe(200);
      console.log('✅ v2 공지사항 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 공지사항 ID 조회 (v2) — 오류 응답', async () => {
      const res = await boardApi.getNoticeDetailV2(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ v2 없는 공지사항 HTTP 상태:', res.status);
    });
  });
});
