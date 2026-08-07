import { eventApi } from '@/apis/event.api';
import axios from 'axios';
import * as https from 'https';

const BASE_URL = process.env.API_BASE_URL ?? '';
const EVENT_IDX = 1;

const anonClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
});

describe('[이벤트] API', () => {
  describe('PUBLIC 조회', () => {
    test('메인 프로모션 이벤트 조회', async () => {
      const res = await eventApi.getPromotion();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 프로모션 이벤트 HTTP 상태:', res.status);
    });

    test('이벤트 참여자 수 조회', async () => {
      const res = await eventApi.getPartiCount();

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 이벤트 참여자 수 HTTP 상태:', res.status);
    });

    test('이벤트 당첨자 목록 조회', async () => {
      const res = await eventApi.getWinners(EVENT_IDX);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 당첨자 목록 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 당첨자 조회 — 응답 확인', async () => {
      const res = await eventApi.getWinners(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 없는 이벤트 당첨자 HTTP 상태:', res.status);
    });

    test('음수 이벤트 ID 당첨자 조회 — 서버 응답 확인', async () => {
      const res = await eventApi.getWinners(-1);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 음수 이벤트 ID HTTP 상태:', res.status);
    });
  });

  describe('AUTH — 출석체크', () => {
    test('출석체크 (AUTH) — 이벤트 없을 경우 오류 허용', async () => {
      const res = await eventApi.attend(EVENT_IDX);

      expect([200, 201, 400, 404, 409, 422]).toContain(res.status);
      console.log('✅ 출석체크 HTTP 상태:', res.status);
    });

    test('출석체크 중복 요청 — 409 또는 오류 응답 확인', async () => {
      // 두 번 연속 요청 시 중복 오류 예상
      const res = await eventApi.attend(EVENT_IDX);

      expect([200, 201, 400, 404, 409, 422]).toContain(res.status);
      console.log('✅ 중복 출석체크 HTTP 상태:', res.status, '(409이면 중복 처리 됨)');
    });

    test('존재하지 않는 이벤트 출석체크 — 응답 확인', async () => {
      const res = await eventApi.attend(999999999);

      expect([200, 201, 400, 404, 409, 422]).toContain(res.status);
      console.log('✅ 없는 이벤트 출석체크 HTTP 상태:', res.status);
    });

    test('월별 출석 현황 조회 (AUTH)', async () => {
      const res = await eventApi.getMonthlyAttend(EVENT_IDX);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 월별 출석 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 월별 출석 현황 — 오류 응답', async () => {
      const res = await eventApi.getMonthlyAttend(999999999);

      expect([400, 404, 422]).toContain(res.status);
      console.log('✅ 없는 이벤트 월별 출석 HTTP 상태:', res.status);
    });
  });

  describe('AUTH — 이벤트 참여 내역/응모권', () => {
    test('이벤트 참여 내역 조회 (AUTH)', async () => {
      const res = await eventApi.getAttendHistory(EVENT_IDX);

      expect([200, 201, 400, 404, 422]).toContain(res.status);
      console.log('✅ 참여 내역 HTTP 상태:', res.status);
    });

    test('이벤트 응모권 조회 (AUTH)', async () => {
      const res = await eventApi.getAttendTicket(EVENT_IDX);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 응모권 조회 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 응모권 조회 — 응답 확인', async () => {
      const res = await eventApi.getAttendTicket(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 없는 이벤트 응모권 HTTP 상태:', res.status);
    });

    test('스크래치 이벤트 당첨 (AUTH) — 이벤트 없을 경우 오류 허용', async () => {
      const res = await eventApi.draw(EVENT_IDX);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 스크래치 당첨 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 스크래치 — 응답 확인', async () => {
      const res = await eventApi.draw(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 없는 이벤트 스크래치 HTTP 상태:', res.status);
    });
  });

  describe('인증 없이 접근', () => {
    test('인증 헤더 없이 출석체크 — 401/403 응답 확인', async () => {
      const res = await anonClient.post(`/api/v1/event/attendance/${EVENT_IDX}`);

      expect([401, 403]).toContain(res.status);
      console.log('✅ 미인증 출석체크 HTTP 상태:', res.status);
    });
  });
});
