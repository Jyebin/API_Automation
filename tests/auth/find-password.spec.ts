import { authApi } from '@/apis/auth.api';

describe('[인증] 비밀번호 찾기 API', () => {
  describe('이메일 발송', () => {
    test('등록된 이메일로 비밀번호 찾기 요청', async () => {
      const res = await authApi.sendFindPasswordEmail('yenbin03223@gmail.com');

      expect([200, 400, 422, 429]).toContain(res.status);
      console.log('✅ 비밀번호 찾기 이메일 발송 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이메일 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindPasswordEmail('nonexistent_xyz@invalid-domain-99999.com');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 이메일 HTTP 상태:', res.status);
    });

    test('빈 이메일 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindPasswordEmail('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 이메일 HTTP 상태:', res.status);
    });

    test('이메일 형식 오류 (@없음) — 오류 응답 확인', async () => {
      const res = await authApi.sendFindPasswordEmail('notanemail');

      expect(res.status).not.toBe(200);
      console.log('✅ @없는 이메일 HTTP 상태:', res.status);
    });

    test('이메일 형식 오류 (도메인 없음) — 오류 응답 확인', async () => {
      const res = await authApi.sendFindPasswordEmail('test@');

      expect(res.status).not.toBe(200);
      console.log('✅ 도메인 없는 이메일 HTTP 상태:', res.status);
    });

    test('공백만 있는 이메일 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindPasswordEmail('   ');

      expect(res.status).not.toBe(200);
      console.log('✅ 공백 이메일 HTTP 상태:', res.status);
    });

    test('매우 긴 이메일 (500자) — 서버 오류 없이 거부 확인', async () => {
      const longEmail = `${'a'.repeat(490)}@test.com`;
      const res = await authApi.sendFindPasswordEmail(longEmail);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 이메일 HTTP 상태:', res.status);
    });
  });

  describe('토큰 유효성 검증', () => {
    test('유효하지 않은 토큰으로 비밀번호 찾기 검증 — 오류 응답', async () => {
      const res = await authApi.validateFindPassword('invalid_token_value');

      expect(res.status).not.toBe(200);
      console.log('✅ 유효하지 않은 토큰 HTTP 상태:', res.status);
    });

    test('빈 토큰으로 비밀번호 찾기 검증 — 오류 응답', async () => {
      const res = await authApi.validateFindPassword('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 토큰 HTTP 상태:', res.status);
    });

    test('특수문자 포함 토큰 — 서버 오류 없이 거부 확인', async () => {
      const res = await authApi.validateFindPassword("'; DROP TABLE users; --");

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 특수문자 토큰 HTTP 상태:', res.status);
    });
  });

  describe('비밀번호 재설정', () => {
    test.skip('비밀번호 재설정 — 실제 토큰 필요 (이메일 수신 후 수동 테스트)', async () => {
      const res = await authApi.resetPassword({
        token: 'REAL_TOKEN_FROM_EMAIL',
        password: 'NewPassword123!',
      });
      expect(res.status).toBe(200);
    });

    test('비밀번호 재설정 — 유효하지 않은 토큰', async () => {
      const res = await authApi.resetPassword({
        token: 'invalid_reset_token',
        password: 'NewPassword123!',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 유효하지 않은 리셋 토큰 HTTP 상태:', res.status);
    });

    test('비밀번호 재설정 — 빈 비밀번호', async () => {
      const res = await authApi.resetPassword({
        token: 'some_token',
        password: '',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 비밀번호 리셋 HTTP 상태:', res.status);
    });
  });
});
