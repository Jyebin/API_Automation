import { authApi } from '@/apis/auth.api';

describe('[인증] 로그인 API', () => {
  describe('기본 로그인 (v1)', () => {
    test('올바른 계정으로 로그인 — 200 및 토큰 반환', async () => {
      const res = await authApi.login(
        process.env.TEST_USERNAME ?? '',
        process.env.TEST_PASSWORD ?? '',
      );

      expect(res.status).toBe(200);
      expect(res.data.content?.access_token).toBeTruthy();

      // 서버가 기존 세션을 무효화하므로 새 토큰으로 갱신
      process.env.__ACCESS_TOKEN__ = res.data.content?.access_token ?? '';
      process.env.__REFRESH_TOKEN__ = res.data.content?.refresh_token ?? '';
      console.log('✅ 기본 로그인 성공, access_token 갱신됨');
    });

    test('잘못된 비밀번호로 로그인 — 오류 응답', async () => {
      const res = await authApi.login(
        process.env.TEST_USERNAME ?? '',
        'WrongPassword999!',
      );

      expect(res.status).not.toBe(200);
      console.log('✅ 잘못된 비밀번호 HTTP 상태:', res.status);
    });

    test('존재하지 않는 계정으로 로그인 — 오류 응답', async () => {
      const res = await authApi.login('nonexistent_user_xyz_99999', 'Password123!');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 계정 HTTP 상태:', res.status);
    });

    test('빈 아이디/비밀번호로 로그인 — 오류 응답', async () => {
      const res = await authApi.login('', '');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 계정 정보 HTTP 상태:', res.status);
    });

    test('SQL Injection 시도 — 서버 오류 없이 거부 확인', async () => {
      const res = await authApi.login("' OR '1'='1", "' OR '1'='1");

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ SQL Injection 로그인 HTTP 상태:', res.status);
    });
  });

  describe('소셜 로그인 (v1)', () => {
    test('유효하지 않은 토큰으로 소셜 로그인 — 오류 응답', async () => {
      const res = await authApi.loginSocial('google', { token: 'invalid_token_value' });

      expect(res.status).not.toBe(200);
      console.log('✅ 잘못된 소셜 토큰 HTTP 상태:', res.status);
    });

    test('빈 토큰으로 소셜 로그인 — 오류 응답', async () => {
      const res = await authApi.loginSocial('google', { token: '' });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 소셜 토큰 HTTP 상태:', res.status);
    });

    test('지원하지 않는 provider로 소셜 로그인 — 오류 응답', async () => {
      const res = await authApi.loginSocial('unknown_provider', { token: 'some_token' });

      expect(res.status).not.toBe(200);
      console.log('✅ 지원하지 않는 provider HTTP 상태:', res.status);
    });
  });
});
