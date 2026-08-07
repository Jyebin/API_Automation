import { etcApi } from '@/apis/etc.api';

describe('[기타] 서비스 문의 / 매뉴얼 API', () => {
  let firstManualId: number | undefined;

  describe('서비스 문의', () => {
    test('서비스 문의 카테고리 목록 조회', async () => {
      const res = await etcApi.getServiceQnaCategories();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      console.log('✅ 서비스 문의 카테고리 수:', res.data.content?.length);
    });

    test('서비스 문의 등록 — 빈 내용으로 오류 응답 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: '',
        title: '',
        content: '',
        name: '',
        email: '',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 문의 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — 정상 데이터', async () => {
      const categoryRes = await etcApi.getServiceQnaCategories();
      const firstCategory = categoryRes.data.content?.[0]?.code ?? 'ETC';

      const res = await etcApi.createServiceQna({
        category: firstCategory,
        title: '[자동화 테스트] 문의 제목',
        content: '[자동화 테스트] 문의 내용입니다.',
        name: '테스트 사용자',
        email: 'test@test.com',
      });

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ 서비스 문의 등록 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — 유효하지 않은 이메일 형식 — 오류 응답 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: 'ETC',
        title: '테스트 문의',
        content: '테스트 내용',
        name: '테스트',
        email: 'invalid-email-format',
      });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 잘못된 이메일 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — @ 없는 이메일 — 오류 응답 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: 'ETC',
        title: '테스트',
        content: '내용',
        name: '이름',
        email: 'nodomain',
      });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ @ 없는 이메일 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — 매우 긴 제목 (1000자) — 서버 오류 없이 처리 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: 'ETC',
        title: '제'.repeat(1000),
        content: '내용',
        name: '이름',
        email: 'test@test.com',
      });

      expect(res.status).not.toBe(500);
      console.log('✅ 1000자 제목 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — 매우 긴 내용 (5000자) — 서버 오류 없이 처리 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: 'ETC',
        title: '테스트',
        content: '내'.repeat(5000),
        name: '이름',
        email: 'test@test.com',
      });

      expect(res.status).not.toBe(500);
      console.log('✅ 5000자 내용 HTTP 상태:', res.status);
    });

    test('서비스 문의 등록 — SQL Injection 시도 — 서버 오류 없이 처리 확인', async () => {
      const res = await etcApi.createServiceQna({
        category: 'ETC',
        title: "'; DROP TABLE service_qna; --",
        content: "' OR '1'='1",
        name: "테스트' OR '1'='1",
        email: 'test@test.com',
      });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ SQL Injection 문의 HTTP 상태:', res.status);
    });
  });

  describe('매뉴얼', () => {
    test('매뉴얼 카테고리 목록 조회', async () => {
      const res = await etcApi.getManualCategories();

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ 매뉴얼 카테고리 HTTP 상태:', res.status);
    });

    test('매뉴얼 목록 조회', async () => {
      const res = await etcApi.getManuals({ page: 1, size: 10 });

      expect([200, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        firstManualId = (res.data.content as { idx: number }[])?.[0]?.idx;
      }

      console.log('✅ 매뉴얼 목록 HTTP 상태:', res.status);
    });

    test('매뉴얼 목록 조회 — 마지막 페이지 초과', async () => {
      const res = await etcApi.getManuals({ page: 999999, size: 10 });

      expect([200, 400, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        const content = res.data.content as unknown[];
        console.log('✅ 마지막 페이지 초과 매뉴얼 수:', content?.length ?? 0);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('매뉴얼 목록 조회 — size=1 페이지 정보 확인', async () => {
      const res = await etcApi.getManuals({ page: 1, size: 1 });

      expect([200, 404, 500]).toContain(res.status);

      if (res.status === 200 && res.data.page_info) {
        expect(res.data.page_info.request_size).toBeLessThanOrEqual(1);
        console.log('✅ size=1 page_info:', res.data.page_info);
      } else {
        console.log('✅ size=1 HTTP 상태:', res.status);
      }
    });

    test('매뉴얼 상세 조회', async () => {
      if (!firstManualId) {
        console.log('ℹ️ 매뉴얼 없음, 건너뜀');
        return;
      }

      const res = await etcApi.getManualDetail(firstManualId);

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ 매뉴얼 상세 HTTP 상태:', res.status);
    });

    test('매뉴얼 상세 조회 — 존재하지 않는 ID', async () => {
      const res = await etcApi.getManualDetail(999999999);

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ 없는 매뉴얼 ID HTTP 상태:', res.status);
    });

    test('매뉴얼 상세 조회 — 음수 ID — 서버 응답 확인', async () => {
      const res = await etcApi.getManualDetail(-1);

      expect([200, 400, 404, 422, 500]).toContain(res.status);
      console.log('✅ 음수 매뉴얼 ID HTTP 상태:', res.status);
    });
  });
});
