import apiClient from '@/client/apiClient';
import type {
  UploadInitResponse,
  UploadTaskResponse,
  UploadStatusResponse,
  ClientFileResponse,
  DownloadBase64Response,
  UploadInitBody,
} from '@/types/files.types';

export const filesApi = {
  initUpload: (body: UploadInitBody) =>
    apiClient.post<UploadInitResponse>('/api/v2/files/upload/init', body),

  checkUploadTask: (uploadId: string) =>
    apiClient.get<UploadTaskResponse>(`/api/v2/files/upload/task/${uploadId}`),

  uploadChunk: (formData: FormData) =>
    apiClient.post('/api/v2/files/upload/chunk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  completeUpload: (uploadId: string) =>
    apiClient.post(`/api/v2/files/upload/complete/${uploadId}`),

  getUploadStatus: (uploadId: string) =>
    apiClient.get<UploadStatusResponse>(`/api/v2/files/upload/status/${uploadId}`),

  getClientFile: () =>
    apiClient.get<ClientFileResponse>('/api/v2/files/client'),

  downloadBase64: (body: { path: string }) =>
    apiClient.post<DownloadBase64Response>('/api/v2/files/download/base64', body),
};
