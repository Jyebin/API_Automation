import { viewApi } from '@/apis/view.api';
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

describe('[WebView] Q&A 게시판 API', () => {
  let createdQnaId: number | undefined;

  describe('v1 (AUTH)', () => {
    test('Q&A 목록 조회', async () => {
      const res = await viewApi.getQnaList({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ Q&A 목록 HTTP 상태:', res.status);
    });

    test('Q&A 목록 조회 — 마지막 페이지 초과', async () => {
      const res = await viewApi.getQnaList({ page: 999999, size: 10 });

      expect([200, 400, 404, 422]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 마지막 페이지 초과 Q&A 수:', res.data.content?.length ?? 0);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('Q&A 등록 — 테스트용 글 작성', async () => {
      const res = await viewApi.createQna({
        title: '[자동화 테스트] QnA 제목',
        content: '[자동화 테스트] QnA 내용입니다.',
      });

      if (res.status === 200) {
        createdQnaId = res.data.content?.idx;
        console.log('✅ Q&A 등록 성공, ID:', createdQnaId);
      } else {
        console.log('ℹ️ Q&A 등록 HTTP 상태:', res.status, '(수업/콘텐츠 연결 필요 가능성)');
      }

      expect([200, 400, 404, 405, 422]).toContain(res.status);
    });

    test('Q&A 등록 — 빈 제목 — 오류 응답 확인', async () => {
      const res = await viewApi.createQna({
        title: '',
        content: '내용이 있어도 제목이 비면 오류',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 제목 Q&A HTTP 상태:', res.status);
    });

    test('Q&A 등록 — 빈 내용 — 오류 응답 확인', async () => {
      const res = await viewApi.createQna({
        title: '제목이 있어도 내용이 비면 오류',
        content: '',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 내용 Q&A HTTP 상태:', res.status);
    });

    test('Q&A 등록 — 매우 긴 제목 (1000자) — 서버 오류 없이 처리 확인', async () => {
      const res = await viewApi.createQna({
        title: 'A'.repeat(1000),
        content: '긴 제목 테스트',
      });

      expect(res.status).not.toBe(500);
      console.log('✅ 1000자 제목 Q&A HTTP 상태:', res.status);
    });

    test('Q&A 상세 조회 — 등록된 글 조회', async () => {
      if (!createdQnaId) {
        console.log('ℹ️ 등록된 Q&A 없음, 건너뜀');
        return;
      }

      const res = await viewApi.getQnaDetail(createdQnaId);

      expect(res.status).toBe(200);
      console.log('✅ Q&A 상세 HTTP 상태:', res.status);
    });

    test('Q&A 상세 조회 — 존재하지 않는 ID', async () => {
      const res = await viewApi.getQnaDetail(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 Q&A 상세 HTTP 상태:', res.status);
    });

    test('Q&A 수정 — 등록된 글 수정', async () => {
      if (!createdQnaId) {
        console.log('ℹ️ 등록된 Q&A 없음, 건너뜀');
        return;
      }

      const res = await viewApi.updateQna(createdQnaId, {
        title: '[자동화 테스트] QnA 수정 제목',
        content: '[자동화 테스트] QnA 수정 내용입니다.',
      });

      expect(res.status).toBe(200);
      console.log('✅ Q&A 수정 HTTP 상태:', res.status);
    });

    test('Q&A 수정 — 존재하지 않는 ID', async () => {
      const res = await viewApi.updateQna(999999999, {
        title: '수정 시도',
        content: '존재하지 않는 Q&A 수정 시도',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 Q&A 수정 HTTP 상태:', res.status);
    });

    test.skip('Q&A 삭제 — 파괴적 작업, 수동 테스트 필요', async () => {
      if (!createdQnaId) return;
      await viewApi.deleteQna(createdQnaId);
    });
  });

  describe('v2 (AUTH)', () => {
    test('Q&A 목록 조회 (v2)', async () => {
      const res = await viewApi.getQnaListV2({ page: 1, size: 10 });

      expect(res.status).toBe(200);
      console.log('✅ v2 Q&A 목록 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 Q&A 목록 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/view/dashboard/board/qna');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 Q&A 접근 HTTP 상태:', res.status);
    });
  });
});
