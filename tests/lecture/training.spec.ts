import { lectureApi } from '@/apis/lecture.api';

describe('[강의] 실습 콘텐츠 API', () => {
  describe('v1 (AUTH)', () => {
    test('개인 실습실 콘텐츠 조회 — 유효하지 않은 ID', async () => {
      const res = await lectureApi.getTrainingContents('INVALID_CONTENTS_ID');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 실습 콘텐츠 HTTP 상태:', res.status);
    });

    test('개인 실습실 콘텐츠 조회 — 빈 ID', async () => {
      const res = await lectureApi.getTrainingContents('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 실습 콘텐츠 ID HTTP 상태:', res.status);
    });

    test('개인 실습실 콘텐츠 조회 — 특수문자 ID', async () => {
      const res = await lectureApi.getTrainingContents("'; DROP TABLE training; --");

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 특수문자 실습 ID HTTP 상태:', res.status);
    });

    test('개인 실습실 콘텐츠 조회 — 매우 긴 ID', async () => {
      const res = await lectureApi.getTrainingContents('X'.repeat(500));

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 실습 ID HTTP 상태:', res.status);
    });
  });

  describe('v2 (AUTH)', () => {
    test('개인 실습실 콘텐츠 조회 (v2) — 유효하지 않은 ID', async () => {
      const res = await lectureApi.getTrainingContentsV2('INVALID_CONTENTS_ID');

      expect(res.status).not.toBe(200);
      console.log('✅ v2 없는 실습 콘텐츠 HTTP 상태:', res.status);
    });

    test('개인 실습실 콘텐츠 조회 (v2) — 빈 ID', async () => {
      const res = await lectureApi.getTrainingContentsV2('');

      expect(res.status).not.toBe(200);
      console.log('✅ v2 빈 실습 ID HTTP 상태:', res.status);
    });

    test('AI 취업준비 콘텐츠 링크 조회', async () => {
      const res = await lectureApi.getAiTrainingContent();

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ AI 콘텐츠 HTTP 상태:', res.status);
    });
  });
});
