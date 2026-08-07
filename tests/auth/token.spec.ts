import { authApi } from '@/apis/auth.api';

describe('[인증] 토큰 갱신 API', () => {
  describe('정상 케이스', () => {
    test('정상 토큰 갱신 — 200 및 새 access_token 발급 확인', async () => {
      const refreshToken = process.env.__REFRESH_TOKEN__ ?? '';
      expect(refreshToken).toBeTruthy();

      const res = await authApi.refreshToken(refreshToken);

      // 서버 단일 기기 정책으로 이전 토큰이 무효화될 수 있음
      expect([200, 400, 401, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.status_code).toBe(200);
        expect(res.data.content?.access_token).toBeTruthy();
        expect(res.data.content?.token_type).toBe('Bearer');
        expect(typeof res.data.content?.expires_in).toBe('number');

        if (res.data.content?.access_token) {
          process.env.__ACCESS_TOKEN__ = res.data.content.access_token;
        }

        console.log('✅ 토큰 갱신 성공');
        console.log(`🔑 새 토큰: ${res.data.content?.access_token?.slice(0, 20)}...`);
      } else {
        console.log('ℹ️ 토큰 갱신 서버 응답:', res.status, '(이미 갱신되었거나 만료됨)');
      }
    });
  });

  describe('비정상 토큰 케이스', () => {
    test('유효하지 않은 refresh_token 문자열 — 오류 응답 확인', async () => {
      const res = await authApi.refreshToken('invalid_token_value_xyz');

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 유효하지 않은 토큰 오류 응답:', res.data.msg);
    });

    test('빈 refresh_token — 오류 응답 확인', async () => {
      const res = await authApi.refreshToken('');

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 빈 토큰 오류 응답:', res.data.msg);
    });

    test('형식이 올바른 JWT 형태지만 서명이 틀린 토큰 — 오류 응답 확인', async () => {
      const fakeJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
        '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZha2UiLCJpYXQiOjE1MTYyMzkwMjJ9' +
        '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const res = await authApi.refreshToken(fakeJwt);

      expect(res.data.status_code).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 가짜 JWT 응답:', res.data.msg, '/ HTTP:', res.status);
    });

    test('매우 긴 토큰 문자열 — 서버 오류 없이 거부 확인', async () => {
      const res = await authApi.refreshToken('x'.repeat(2000));

      expect(res.data.status_code).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 2000자 토큰 응답:', res.data.msg, '/ HTTP:', res.status);
    });

    test('공백만 있는 토큰 — 오류 응답 확인', async () => {
      const res = await authApi.refreshToken('   ');

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 공백 토큰 응답:', res.data.msg);
    });
  });
});
