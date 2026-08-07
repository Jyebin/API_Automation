import axios from 'axios';
import * as https from 'https';
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { LoginResponse } from '../types/api';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function globalSetup() {
  const baseURL = process.env.API_BASE_URL;
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!baseURL || !username || !password) {
    throw new Error('.env에 API_BASE_URL, TEST_USERNAME, TEST_PASSWORD를 설정해 주세요.');
  }

  const response = await axios.post<LoginResponse>(
    `${baseURL}/api/v1/member/auth/login/basic`,
    { userid: username, password },
    { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
  );

  const { status_code, content } = response.data;

  if (status_code !== 200 || !content?.access_token) {
    throw new Error(`글로벌 셋업 로그인 실패: ${response.data.msg}`);
  }

  process.env.__ACCESS_TOKEN__ = content.access_token;
  process.env.__REFRESH_TOKEN__ = content.refresh_token;

  console.log('✅ [Global Setup] 로그인 완료 — 토큰 발급됨');
  console.log(`🔑 Access Token: ${content.access_token.slice(0, 20)}...`);
}

export default globalSetup;
