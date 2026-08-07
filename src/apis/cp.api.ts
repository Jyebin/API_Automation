import apiClient from '@/client/apiClient';
import type { TrainingStatusResponse } from '@/types/cp.types';

export const cpApi = {
  // ── 실습 (v1) ─────────────────────────────────────────────────────────
  startTraining: (params: Record<string, string>) =>
    apiClient.get('/api/v1/cp/training/start', { params }),

  endTraining: (params: Record<string, string>) =>
    apiClient.get('/api/v1/cp/training/end', { params }),

  getTrainingStatus: (params: Record<string, string>) =>
    apiClient.get<TrainingStatusResponse>('/api/v1/cp/training/status', { params }),

  updateTrainingStatus: (body: Record<string, unknown>) =>
    apiClient.post('/api/v1/cp/training/status', body),

  deleteTrainingStatus: (params: Record<string, string>) =>
    apiClient.delete('/api/v1/cp/training/status', { params }),

  // ── 실습 (v2) ─────────────────────────────────────────────────────────
  startTrainingV2: (params: Record<string, string>) =>
    apiClient.get('/api/v2/cp/training/start', { params }),

  endTrainingV2: (params: Record<string, string>) =>
    apiClient.get('/api/v2/cp/training/end', { params }),

  getTrainingStatusV2: (params: Record<string, string>) =>
    apiClient.get('/api/v2/cp/training/status', { params }),

  updateTrainingStatusV2: (body: Record<string, unknown>) =>
    apiClient.post('/api/v2/cp/training/update', body),

  deleteTrainingStatusV2: (params: Record<string, string>) =>
    apiClient.delete('/api/v2/cp/training/delete', { params }),
};
