import { filesApi } from '@/apis/files.api';
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

describe('[파일] API', () => {
  describe('클라이언트 설치파일', () => {
    test('클라이언트 설치파일 URL 조회 (AUTH)', async () => {
      const res = await filesApi.getClientFile();

      expect([200, 404, 422]).toContain(res.status);
      console.log('✅ 클라이언트 파일 HTTP 상태:', res.status);
    });
  });

  describe('파일 업로드 초기화 — 입력 검증', () => {
    test('파일 업로드 초기화 — 빈 파라미터 — 오류 응답 확인', async () => {
      const res = await filesApi.initUpload({
        file_name: '',
        file_size: 0,
        mime_type: '',
      });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 파라미터 업로드 초기화 HTTP 상태:', res.status);
    });

    test('파일 업로드 초기화 — 정상 JPEG 파일 파라미터', async () => {
      const res = await filesApi.initUpload({
        file_name: 'test_image.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ JPEG 업로드 초기화 HTTP 상태:', res.status);
    });

    test('파일 업로드 초기화 — 정상 PNG 파일 파라미터', async () => {
      const res = await filesApi.initUpload({
        file_name: 'test_image.png',
        file_size: 2048,
        mime_type: 'image/png',
      });

      expect([200, 400, 422]).toContain(res.status);
      console.log('✅ PNG 업로드 초기화 HTTP 상태:', res.status);
    });

    test('파일 업로드 초기화 — 유효하지 않은 MIME 타입 — 오류 응답 확인', async () => {
      const res = await filesApi.initUpload({
        file_name: 'test_file.xyz',
        file_size: 1024,
        mime_type: 'application/x-unknown-invalid-type',
      });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 유효하지 않은 MIME 타입 HTTP 상태:', res.status);
    });

    test('파일 업로드 초기화 — 음수 파일 크기 — 서버 오류 없이 거부 확인', async () => {
      const res = await filesApi.initUpload({
        file_name: 'test_file.jpg',
        file_size: -1,
        mime_type: 'image/jpeg',
      });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ 음수 파일 크기 HTTP 상태:', res.status);
    });

    test('파일 업로드 초기화 — 매우 긴 파일명 (500자) — 서버 오류 없이 처리 확인', async () => {
      const res = await filesApi.initUpload({
        file_name: 'f'.repeat(490) + '.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });

      expect(res.status).not.toBe(500);
      console.log('✅ 500자 파일명 HTTP 상태:', res.status);
    });
  });

  describe('업로드 태스크 조회', () => {
    test('존재하지 않는 upload_id로 태스크 조회 — 응답 확인', async () => {
      const res = await filesApi.checkUploadTask('INVALID_UPLOAD_ID');

      expect([200, 400, 404, 422]).toContain(res.status);
      console.log('✅ 없는 upload_id HTTP 상태:', res.status);
    });

    test('빈 upload_id로 태스크 조회 — 오류 응답 확인', async () => {
      const res = await filesApi.checkUploadTask('');

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 upload_id HTTP 상태:', res.status);
    });

    test('특수문자 upload_id로 태스크 조회 — 서버 오류 없이 처리 확인', async () => {
      const res = await filesApi.checkUploadTask("'; DROP TABLE uploads; --");

      expect(res.status).not.toBe(500);
      console.log('✅ 특수문자 upload_id HTTP 상태:', res.status);
    });
  });

  describe('파일 다운로드', () => {
    test('public 파일 다운로드(Base64) — 빈 경로 — 오류 응답', async () => {
      const res = await filesApi.downloadBase64({ path: '' });

      expect(res.status).not.toBe(200);
      console.log('✅ 빈 경로 다운로드 HTTP 상태:', res.status);
    });

    test('public 파일 다운로드(Base64) — 존재하지 않는 경로', async () => {
      const res = await filesApi.downloadBase64({ path: '/nonexistent/file/path/xyz.jpg' });

      expect(res.status).not.toBe(200);
      console.log('✅ 없는 경로 다운로드 HTTP 상태:', res.status);
    });

    test('public 파일 다운로드(Base64) — Path Traversal 시도 — 서버 오류 없이 거부 확인', async () => {
      const res = await filesApi.downloadBase64({ path: '../../../../etc/passwd' });

      expect(res.status).not.toBe(200);
      expect(res.status).not.toBe(500);
      console.log('✅ Path Traversal 시도 HTTP 상태:', res.status);
    });
  });
});
