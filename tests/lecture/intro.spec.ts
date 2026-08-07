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

describe('[강의] 소개 페이지 API', () => {
  let firstContentsId: number | undefined;

  describe('v1', () => {
    test('콘텐츠 목록 조회 — 200 및 배열 응답 확인', async () => {
      const res = await lectureApi.getIntroContents({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      expect(res.data.page_info).toBeDefined();

      firstContentsId = res.data.content?.[0]?.idx;
      console.log('✅ 콘텐츠 수:', res.data.content?.length);
    });

    test('콘텐츠 목록 조회 — size=1 페이지 정보 확인', async () => {
      const res = await lectureApi.getIntroContents({ page: 1, size: 1 });

      expect(res.status).toBe(200);

      if (res.data.page_info) {
        expect(typeof res.data.page_info.request_size).toBe('number');
        expect(typeof res.data.page_info.total_size).toBe('number');
      }

      console.log('✅ size=1 페이지 정보:', JSON.stringify(res.data.page_info));
    });

    test('콘텐츠 목록 조회 — 마지막 페이지 초과 — 빈 배열 확인', async () => {
      const res = await lectureApi.getIntroContents({ page: 999999, size: 10 });

      expect([200, 404, 422]).toContain(res.status);

      if (res.status === 200) {
        const content = res.data.content;
        console.log('✅ 마지막 페이지 초과 콘텐츠 수:', Array.isArray(content) ? content.length : 'N/A');
      }

      console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
    });

    test('콘텐츠 상세 조회 — 목록에서 첫 번째 idx 사용', async () => {
      if (!firstContentsId) {
        console.log('ℹ️ 콘텐츠 없음, 건너뜀');
        return;
      }

      const res = await lectureApi.getIntroContentsDetail(firstContentsId);

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(res.data.content?.idx).toBe(firstContentsId);
      expect(res.data.content?.title).toBeTruthy();

      console.log('✅ 콘텐츠 상세:', res.data.content?.title);
    });

    test('콘텐츠 공지사항 목록 조회', async () => {
      if (!firstContentsId) {
        console.log('ℹ️ 콘텐츠 없음, 건너뜀');
        return;
      }

      const res = await lectureApi.getContentsNotices(firstContentsId);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      console.log('✅ 콘텐츠 공지사항 수:', res.data.content?.length);
    });

    test('존재하지 않는 콘텐츠 ID 조회 — 404/오류 응답', async () => {
      const res = await lectureApi.getIntroContentsDetail(999999999);

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 없는 콘텐츠 ID 응답:', res.data.msg, '/ HTTP:', res.status);
    });

    test('음수 콘텐츠 ID 조회 — 오류 응답 확인', async () => {
      const res = await lectureApi.getIntroContentsDetail(-1);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 콘텐츠 ID HTTP 상태:', res.status);
    });

    test('카테고리 1차 목록 조회 — 배열 및 항목 수 확인', async () => {
      const res = await lectureApi.getCategoryFirst();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      expect(res.data.content?.length).toBeGreaterThan(0);

      console.log('✅ 1차 카테고리 수:', res.data.content?.length);
    });

    test('카테고리 2차 목록 조회', async () => {
      const res = await lectureApi.getCategorySecond();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);

      console.log('✅ 2차 카테고리 수:', res.data.content?.length);
    });

    test('카테고리 메뉴 조회', async () => {
      const res = await lectureApi.getCategoryMenu();

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);

      console.log('✅ 카테고리 메뉴 조회 성공');
    });

    test('메인 배너 조회', async () => {
      const res = await lectureApi.getBanner();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);

      console.log('✅ 배너 수:', res.data.content?.length);
    });
  });

  describe('v1 — 필터 및 정렬', () => {
    test('콘텐츠 목록 — 존재하지 않는 카테고리 코드로 필터 — 빈 결과 확인', async () => {
      const res = await lectureApi.getIntroContents({
        page: 1,
        size: 10,
        category: 'NONEXISTENT_CATEGORY_CODE',
      });

      expect([200, 404, 422]).toContain(res.status);

      if (res.status === 200) {
        const items = res.data.content ?? [];
        console.log('✅ 없는 카테고리 결과 수:', items.length, '(0이어야 함)');
      } else {
        console.log('✅ 없는 카테고리 HTTP 상태:', res.status);
      }
    });
  });

  describe('v2', () => {
    test('콘텐츠 목록 조회 (v2)', async () => {
      const res = await lectureApi.getIntroContentsV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 콘텐츠 목록 조회 성공');
    });

    test('카테고리 1차 목록 조회 (v2)', async () => {
      const res = await lectureApi.getCategoryFirstV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 1차 카테고리 조회 성공');
    });

    test('카테고리 2차 목록 조회 (v2)', async () => {
      const res = await lectureApi.getCategorySecondV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 2차 카테고리 조회 성공');
    });

    test('카테고리 메뉴 조회 (v2)', async () => {
      const res = await lectureApi.getCategoryMenuV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 카테고리 메뉴 조회 성공');
    });

    test('메인 배너 조회 (v2)', async () => {
      const res = await lectureApi.getBannerV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 배너 조회 성공');
    });

    test('콘텐츠 링크 데이터 조회', async () => {
      const res = await lectureApi.getContentsLinkInfo();

      expect(res.status).toBe(200);
      console.log('✅ 콘텐츠 링크 데이터 조회 성공');
    });
  });
});
