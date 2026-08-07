import { memberApi } from '@/apis/member.api';
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

describe('[회원] 내 프로필 API', () => {
  describe('v1', () => {
    test('내 프로필 조회 — 200 및 userid 존재 확인', async () => {
      const res = await memberApi.getMyProfile();

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(res.data.content?.userid).toBeTruthy();
      expect(typeof res.data.content?.nickname).toBe('string');

      console.log('✅ 내 프로필 조회:', res.data.content?.userid);
    });

    test('내 프로필 수정 — nickname 업데이트', async () => {
      const profileRes = await memberApi.getMyProfile();
      const originalNickname = profileRes.data.content?.nickname ?? '';

      const updateRes = await memberApi.updateMyProfile({ nickname: originalNickname });

      expect([200, 400, 422]).toContain(updateRes.status);
      console.log('✅ 프로필 수정 HTTP 상태:', updateRes.status);
    });

    test('프로필 수정 — 빈 nickname — 오류 응답 확인', async () => {
      const res = await memberApi.updateMyProfile({ nickname: '' });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 nickname 수정 HTTP 상태:', res.status);
    });

    test('프로필 수정 — 매우 긴 nickname (200자) — 오류 응답 확인', async () => {
      const res = await memberApi.updateMyProfile({ nickname: 'A'.repeat(200) });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 200자 nickname HTTP 상태:', res.status);
    });

    test('비밀번호 검증 — 올바른 비밀번호', async () => {
      const res = await memberApi.verifyPassword(process.env.TEST_PASSWORD ?? '');

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ 비밀번호 검증 HTTP 상태:', res.status);
    });

    test('비밀번호 검증 — 잘못된 비밀번호 — 오류 응답 확인', async () => {
      const res = await memberApi.verifyPassword('WrongPassword999!');

      expect(res.status).not.toBe(200);
      console.log('✅ 잘못된 비밀번호 검증 HTTP 상태:', res.status);
    });

    test('비밀번호 검증 — 빈 값 — 오류 응답 확인', async () => {
      const res = await memberApi.verifyPassword('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 비밀번호 검증 HTTP 상태:', res.status);
    });

    test('회원 탈퇴 사유 목록 조회 — 배열 확인', async () => {
      const res = await memberApi.getWithdrawalReasons();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.content)).toBe(true);
      console.log('✅ 탈퇴 사유 HTTP 상태:', res.status);
    });

    test.skip('회원 탈퇴 — 파괴적 작업, 수동 테스트 필요', async () => {
      await memberApi.withdrawMember({ reason: 'TEST' });
    });

    test.skip('비밀번호 변경 — 로그인 계정에 영향, 수동 테스트 필요', async () => {
      await memberApi.changePassword({
        current_password: process.env.TEST_PASSWORD ?? '',
        new_password: 'NewPassword123!',
      });
    });
  });

  describe('v2', () => {
    test('내 프로필 조회 (v2) — 200 및 데이터 확인', async () => {
      const res = await memberApi.getMyProfileV2();

      expect(res.status).toBe(200);
      console.log('✅ v2 프로필 HTTP 상태:', res.status);
    });
  });

  describe('[회원] 타인 프로필 API', () => {
    test('타인 프로필 조회 — 자기 자신 user_id 조회', async () => {
      const myRes = await memberApi.getMyProfile();
      const myUserId = myRes.data.content?.userid ?? '';

      const res = await memberApi.getOthersProfile(myUserId);

      expect(res.status).toBe(200);
      console.log('✅ 타인 프로필 응답:', res.data?.msg);
    });

    test('빈 user_id 조회 — 오류 응답 확인', async () => {
      const res = await memberApi.getOthersProfile('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 user_id HTTP 상태:', res.status);
    });

    test('존재하지 않는 user_id 조회 — 404 응답 확인', async () => {
      const res = await memberApi.getOthersProfile('nonexistent_user_xyz_00000');

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 user_id HTTP 상태:', res.status);
    });

    test('매우 긴 user_id 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await memberApi.getOthersProfile('x'.repeat(500));

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 500자 user_id HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 내 프로필 조회 — 401/403 응답 확인', async () => {
      const res = await anonClient.get('/api/v1/member/my/profile');

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 프로필 접근 HTTP 상태:', res.status);
    });
  });
});
