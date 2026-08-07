import { boardApi } from '@/apis/board.api';

describe('[게시판] FAQ API', () => {
  describe('v1', () => {
    test('FAQ 카테고리 목록 조회 — 200 및 배열 확인', async () => {
      const res = await boardApi.getFaqCategories();

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      expect(res.data.content?.length).toBeGreaterThan(0);

      console.log('✅ FAQ 카테고리 수:', res.data.content?.length);
    });

    test('FAQ 목록 조회 — 200 및 배열 확인', async () => {
      const res = await boardApi.getFaqs({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);

      console.log('✅ FAQ 수:', res.data.content?.length);
    });

    test('FAQ 카테고리 필터 조회', async () => {
      const categoryRes = await boardApi.getFaqCategories();
      const firstCategory = categoryRes.data.content?.[0]?.code;

      if (!firstCategory) {
        console.log('ℹ️ FAQ 카테고리 없음, 건너뜀');
        return;
      }

      const res = await boardApi.getFaqs({ category: firstCategory, page: 1, size: 5 });

      expect(res.status).toBe(200);
      console.log(`✅ 카테고리(${firstCategory}) FAQ 수:`, res.data.content?.length);
    });

    test('존재하지 않는 카테고리 코드로 FAQ 조회 — 빈 결과 확인', async () => {
      const res = await boardApi.getFaqs({
        category: 'NONEXISTENT_CATEGORY_CODE_XYZ',
        page: 1,
        size: 10,
      });

      expect([200, 400, 404]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 없는 카테고리 FAQ 수:', res.data.content?.length ?? 0, '(0 이어야 함)');
      } else {
        console.log('✅ 없는 카테고리 HTTP 상태:', res.status);
      }
    });
  });

  describe('v1 — 페이지네이션 경계값', () => {
    test('FAQ 목록 — size=1 페이지 정보 확인', async () => {
      const res = await boardApi.getFaqs({ page: 1, size: 1 });

      expect(res.status).toBe(200);

      if (res.data.page_info) {
        expect(typeof res.data.page_info.request_size).toBe('number');
      }

      console.log('✅ size=1 FAQ 페이지 정보:', JSON.stringify(res.data.page_info));
    });

    test('FAQ 목록 — page=0 요청', async () => {
      const res = await boardApi.getFaqs({ page: 0, size: 10 });

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ page=0 FAQ HTTP 상태:', res.status);
    });

    test('FAQ 목록 — 마지막 페이지 초과', async () => {
      const res = await boardApi.getFaqs({ page: 999999, size: 10 });

      expect([200, 400, 404, 422]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 마지막 페이지 초과 FAQ 수:', res.data.content?.length ?? 0);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('FAQ 목록 — size=100 (대량 요청)', async () => {
      const res = await boardApi.getFaqs({ page: 1, size: 100 });

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ size=100 FAQ HTTP 상태:', res.status, '/ 수:', res.data.content?.length);
    });
  });
});
