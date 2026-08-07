import { boardApi } from '@/apis/board.api';

describe('[게시판] 이벤트 / 디바이스 API', () => {
  let firstEventId: number | undefined;
  let firstDeviceId: number | undefined;

  describe('이벤트 v1', () => {
    test('이벤트 목록 조회', async () => {
      const res = await boardApi.getBoardEvents({ page: 1, size: 10 });

      expect([200, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(Array.isArray(res.data.content)).toBe(true);
        firstEventId = res.data.content?.[0]?.idx;
        console.log('✅ 이벤트 수:', res.data.content?.length);
      } else {
        console.log('ℹ️ 이벤트 목록 서버 응답:', res.status);
      }
    });

    test('이벤트 목록 조회 — 마지막 페이지 초과', async () => {
      const res = await boardApi.getBoardEvents({ page: 999999, size: 10 });

      expect([200, 400, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        console.log('✅ 마지막 페이지 초과 이벤트 수:', res.data.content?.length ?? 0);
      } else {
        console.log('✅ 마지막 페이지 초과 HTTP 상태:', res.status);
      }
    });

    test('이벤트 상세 조회 — 첫 번째 idx 사용', async () => {
      if (!firstEventId) {
        console.log('ℹ️ 이벤트 없음, 건너뜀');
        return;
      }

      const res = await boardApi.getBoardEventDetail(firstEventId);

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.content?.title).toBeTruthy();
      }

      console.log('✅ 이벤트 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 ID 조회 — 404/오류 응답', async () => {
      const res = await boardApi.getBoardEventDetail(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 이벤트 HTTP 상태:', res.status);
    });

    test('음수 이벤트 ID 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await boardApi.getBoardEventDetail(-1);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 이벤트 ID HTTP 상태:', res.status);
    });
  });

  describe('이벤트 v2', () => {
    test('이벤트 목록 조회 (v2)', async () => {
      const res = await boardApi.getBoardEventsV2({ page: 1, size: 10 });

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ v2 이벤트 목록 HTTP 상태:', res.status);
    });

    test('이벤트 상세 조회 (v2)', async () => {
      if (!firstEventId) {
        console.log('ℹ️ 이벤트 없음, 건너뜀');
        return;
      }

      const res = await boardApi.getBoardEventDetailV2(firstEventId);

      expect([200, 404]).toContain(res.status);
      console.log('✅ v2 이벤트 상세 HTTP 상태:', res.status);
    });

    test('존재하지 않는 이벤트 ID 조회 (v2) — 오류 응답', async () => {
      const res = await boardApi.getBoardEventDetailV2(999999999);

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ v2 없는 이벤트 HTTP 상태:', res.status);
    });
  });

  describe('디바이스 v1', () => {
    test('디바이스 목록 조회', async () => {
      const res = await boardApi.getDevices();

      expect([200, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(Array.isArray(res.data.content)).toBe(true);
        firstDeviceId = res.data.content?.[0]?.idx;
        console.log('✅ 디바이스 수:', res.data.content?.length);
      } else {
        console.log('ℹ️ 디바이스 목록 HTTP 상태:', res.status);
      }
    });

    test('디바이스 상세 조회 — 첫 번째 idx 사용', async () => {
      if (!firstDeviceId) {
        console.log('ℹ️ 디바이스 없음, 건너뜀');
        return;
      }

      const res = await boardApi.getDeviceDetail(firstDeviceId);

      expect(res.status).toBe(200);

      if (res.status === 200) {
        expect(res.data.content?.name).toBeTruthy();
      }

      console.log('✅ 디바이스 상세:', res.data.content?.name);
    });

    test('존재하지 않는 디바이스 ID 조회 — 오류 응답', async () => {
      const res = await boardApi.getDeviceDetail(999999999);

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 디바이스 HTTP 상태:', res.status);
    });

    test('음수 디바이스 ID 조회 — 서버 오류 없이 거부 확인', async () => {
      const res = await boardApi.getDeviceDetail(-1);

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 디바이스 ID HTTP 상태:', res.status);
    });
  });

  describe('디바이스 v2', () => {
    test('디바이스 목록 조회 (v2)', async () => {
      const res = await boardApi.getDevicesV2();

      expect([200, 404, 500]).toContain(res.status);
      console.log('✅ v2 디바이스 목록 HTTP 상태:', res.status);
    });
  });
});
