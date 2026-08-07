import { authApi } from '@/apis/auth.api';

describe('[인증] 아이디 찾기 API', () => {
  describe('OTP 발송 — 이메일', () => {
    test('등록된 이메일로 OTP 발송 — 200 또는 이미 발송 응답', async () => {
      const res = await authApi.sendFindIdOtp('email', {
        email: process.env.TEST_EMAIL ?? 'yenbin03223@gmail.com',
      });

      expect([200, 400, 422, 429]).toContain(res.status);
      console.log('✅ OTP 발송 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이메일 OTP 발송 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindIdOtp('email', {
        email: 'nonexistent_user_test_xyz@invalid-domain-99999.com',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 이메일 HTTP 상태:', res.status);
    });

    test('빈 이메일 OTP 발송 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindIdOtp('email', { email: '' });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 이메일 HTTP 상태:', res.status);
    });

    test('이메일 형식 오류 (@없음) — 오류 응답 확인', async () => {
      const res = await authApi.sendFindIdOtp('email', {
        email: 'notanemail',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ @없는 이메일 HTTP 상태:', res.status);
    });

    test('이메일 형식 오류 (도메인 없음) — 오류 응답 확인', async () => {
      const res = await authApi.sendFindIdOtp('email', {
        email: 'test@',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 도메인 없는 이메일 HTTP 상태:', res.status);
    });

    test('이메일에 공백 포함 — 오류 응답 확인', async () => {
      const res = await authApi.sendFindIdOtp('email', {
        email: 'test user@example.com',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 공백 포함 이메일 HTTP 상태:', res.status);
    });
  });

  describe('OTP 인증 — 아이디 확인', () => {
    test('잘못된 OTP(000000)로 아이디 확인 — 오류 응답 확인', async () => {
      const res = await authApi.confirmFindId('email', {
        email: 'yenbin03223@gmail.com',
        otp: '000000',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 잘못된 OTP HTTP 상태:', res.status);
    });

    test('잘못된 OTP(문자) — 오류 응답 확인', async () => {
      const res = await authApi.confirmFindId('email', {
        email: 'yenbin03223@gmail.com',
        otp: 'ABCDEF',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 문자 OTP HTTP 상태:', res.status);
    });

    test('빈 이메일 + 빈 OTP — 오류 응답 확인', async () => {
      const res = await authApi.confirmFindId('email', {
        email: '',
        otp: '',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 이메일+OTP HTTP 상태:', res.status);
    });

    test('존재하지 않는 이메일 + 임의 OTP — 오류 응답 확인', async () => {
      const res = await authApi.confirmFindId('email', {
        email: 'nobody@nowhere-xyz-99999.com',
        otp: '123456',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 이메일 OTP 확인 HTTP 상태:', res.status);
    });
  });
});
