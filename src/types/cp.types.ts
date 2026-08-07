import type { ApiResponse } from './api';

export interface TrainingStartParams {
  contents_id: string;
  user_id?: string;
  session_id?: string;
}

export interface TrainingStatus {
  contents_id: string;
  user_id: string;
  status: string;
  started_at: string;
  updated_at: string;
}

export type TrainingStatusResponse = ApiResponse<TrainingStatus>;
export type TrainingResponse = ApiResponse<unknown>;
