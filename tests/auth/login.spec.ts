import apiClient from '@/client/apiClient';
import axios from 'axios';
import * as https from 'https';
import type { LoginResponse } from '@/types/api';

const BASE_URL = process.env.API_BASE_URL ?? '';
const USERNAME = process.env.TEST_USERNAME ?? '';
const PASSWORD = process.env.TEST_PASSWORD ?? '';

const anonClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
});

describe('[인증] 로그인 API', () => {
  describe('정상 케이스', () => {
    test('정상 로그인 — 200 및 access_token/refresh_token 발급 확인', async () => {
      const res = await apiClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: USERNAME,
        password: PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.data.status_code).toBe(200);
      expect(res.data.msg).toBe('로그인 성공');
      expect(res.data.content?.access_token).toBeTruthy();
      expect(res.data.content?.refresh_token).toBeTruthy();
      expect(res.data.content?.token_type).toBe('Bearer');
      expect(typeof res.data.content?.expires_in).toBe('number');

      console.log('✅ 로그인 성공:', res.data.msg);
    });
  });

  describe('인증 실패 케이스', () => {
    test('잘못된 비밀번호 — 400 응답 및 실패 메시지 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: USERNAME,
        password: 'WrongPassword999!',
      });

      expect(res.data.status_code).toBe(400);
      expect(res.data.status_code).not.toBe(200);
      expect(res.data.content).toBeFalsy();
      console.log('✅ 잘못된 비밀번호 응답:', res.data.msg);
    });

    test('존재하지 않는 userid — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: 'nonexistent_user_xyz_99999',
        password: PASSWORD,
      });

      expect(res.data.status_code).not.toBe(200);
      expect(res.data.content).toBeFalsy();
      console.log('✅ 없는 유저 응답:', res.data.msg);
    });

    test('빈 userid — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: '',
        password: PASSWORD,
      });

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 빈 userid 응답:', res.data.msg);
    });

    test('빈 비밀번호 — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: USERNAME,
        password: '',
      });

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 빈 비밀번호 응답:', res.data.msg);
    });

    test('userid/password 모두 빈 값 — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: '',
        password: '',
      });

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 둘 다 빈 값 응답:', res.data.msg);
    });
  });

  describe('입력 검증 케이스', () => {
    test('공백만 있는 userid — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: '   ',
        password: PASSWORD,
      });

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 공백 userid 응답:', res.data.msg);
    });

    test('매우 긴 비밀번호 (1000자) — 오류 응답 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: USERNAME,
        password: 'A'.repeat(1000),
      });

      expect(res.data.status_code).not.toBe(200);
      console.log('✅ 1000자 비밀번호 응답:', res.data.msg, '/ HTTP:', res.status);
    });

    test('SQL Injection 패턴 userid — 서버 오류 없이 정상 거부 확인', async () => {
      const res = await anonClient.post<LoginResponse>('/api/v1/member/auth/login/basic', {
        userid: "' OR '1'='1",
        password: "' OR '1'='1",
      });

      expect(res.data.status_code).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ SQL Injection 응답:', res.data.msg, '/ HTTP:', res.status);
    });

    test('userid 필드 누락 — 오류 응답 확인', async () => {
      const res = await anonClient.post('/api/v1/member/auth/login/basic', {
        password: PASSWORD,
      });

      expect(res.status).not.toBe(200);
      console.log('✅ userid 누락 HTTP 상태:', res.status);
    });

    test('password 필드 누락 — 오류 응답 확인', async () => {
      const res = await anonClient.post('/api/v1/member/auth/login/basic', {
        userid: USERNAME,
      });

      expect(res.status).not.toBe(200);
      console.log('✅ password 누락 HTTP 상태:', res.status);
    });

    test('빈 body — 오류 응답 확인', async () => {
      const res = await anonClient.post('/api/v1/member/auth/login/basic', {});

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 body HTTP 상태:', res.status);
    });
  });
});
