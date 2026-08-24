import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { logApiCall } from '@/utils/testLogger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = process.env.API_BASE_URL ?? '';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig & { _startMs?: number; _testName?: string }) => {
  const token = process.env.__ACCESS_TOKEN__;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config._startMs  = Date.now();
  // Jest 테스트 실행 중이면 현재 테스트명 캡처
  config._testName = (global as Record<string, unknown>).__currentTestName as string ?? 'unknown';
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const cfg = response.config as InternalAxiosRequestConfig & { _startMs?: number; _testName?: string };
    const duration = Date.now() - (cfg._startMs ?? Date.now());
    const url = `${cfg.baseURL ?? ''}${cfg.url ?? ''}`;

    let body = cfg.data;
    try { body = typeof body === 'string' ? JSON.parse(body) : body; } catch {}

    // 응답 바디: 너무 크면 일부만 저장
    let resBody = response.data;
    try {
      const str = JSON.stringify(resBody);
      if (str.length > 2000) resBody = JSON.parse(str.slice(0, 2000) + '...truncated');
    } catch {}

    logApiCall({
      testName:    cfg._testName ?? 'unknown',
      method:      (cfg.method ?? 'GET').toUpperCase(),
      url,
      params:      cfg.params,
      requestBody: body,
      statusCode:  response.status,
      responseBody: resBody,
      durationMs:  duration,
    });

    return response;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
