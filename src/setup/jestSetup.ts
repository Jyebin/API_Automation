import { clearLog } from '@/utils/testLogger';

// 전체 테스트 시작 전 로그 초기화
beforeAll(() => {
  clearLog();
});

// 각 테스트 시작 시 현재 테스트명을 전역에 저장 → apiClient 인터셉터에서 읽음
beforeEach(() => {
  (global as Record<string, unknown>).__currentTestName =
    expect.getState().currentTestName ?? 'unknown';
});

afterEach(() => {
  (global as Record<string, unknown>).__currentTestName = undefined;
});
