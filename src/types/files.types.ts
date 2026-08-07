import type { ApiResponse } from './api';

export interface UploadInitBody {
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface UploadInitResult {
  upload_id: string;
  chunk_size: number;
}

export interface UploadTask {
  is_allowed: boolean;
  reason?: string;
}

export interface UploadStatus {
  upload_id: string;
  status: string;
  progress: number;
}

export interface ClientFileUrl {
  url: string;
  version: string;
}

export type UploadInitResponse = ApiResponse<UploadInitResult>;
export type UploadTaskResponse = ApiResponse<UploadTask>;
export type UploadStatusResponse = ApiResponse<UploadStatus>;
export type ClientFileResponse = ApiResponse<ClientFileUrl>;
export type DownloadBase64Response = ApiResponse<{ data: string }>;
