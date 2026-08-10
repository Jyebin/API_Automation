import apiClient from '@/client/apiClient';
import type {
  LectureContentsListResponse,
  LectureContentsDetailResponse,
  ContentsNoticeListResponse,
  BannerListResponse,
  CategoryFirstListResponse,
  CategorySecondListResponse,
} from '@/types/lecture.types';

export const lectureApi = {
  // ── 소개 페이지 (v1, PUBLIC) ──────────────────────────────────────────
  getIntroContents: (params?: { page?: number; size?: number; category?: string }) =>
    apiClient.get<LectureContentsListResponse>('/api/v1/lecture/intro/contents', { params }),

  getIntroContentsDetail: (contents_id: number | string) =>
    apiClient.get<LectureContentsDetailResponse>(`/api/v1/lecture/intro/contents/${contents_id}`),

  getContentsNotices: (contents_id: number | string) =>
    apiClient.get<ContentsNoticeListResponse>(`/api/v1/lecture/intro/contents/${contents_id}/notice`),

  getContentsNoticeDetail: (contents_id: number | string, notice_id: number | string) =>
    apiClient.get(`/api/v1/lecture/intro/contents/${contents_id}/notice/${notice_id}`),

  getCategoryFirst: () =>
    apiClient.get<CategoryFirstListResponse>('/api/v1/lecture/intro/category/first'),

  getCategorySecond: (params?: { first_code?: string }) =>
    apiClient.get<CategorySecondListResponse>('/api/v1/lecture/intro/category/second', { params }),

  getCategoryMenu: () =>
    apiClient.get('/api/v1/lecture/intro/category/menu'),

  getBanner: () =>
    apiClient.get<BannerListResponse>('/api/v1/lecture/intro/banner'),

  // ── 소개 페이지 (v2, PUBLIC) ──────────────────────────────────────────
  getIntroContentsV2: (params?: { page?: number; size?: number; category?: string }) =>
    apiClient.get('/api/v2/lecture/intro/contents', { params }),

  getIntroContentsDetailV2: (contentId: number | string) =>
    apiClient.get(`/api/v2/lecture/intro/contents/${contentId}`),

  getContentsNoticesV2: (contentId: number | string) =>
    apiClient.get(`/api/v2/lecture/intro/contents/${contentId}/notice`),

  getCategoryFirstV2: () =>
    apiClient.get('/api/v2/lecture/intro/category/first'),

  getCategorySecondV2: (params?: { first_code?: string }) =>
    apiClient.get('/api/v2/lecture/intro/category/second', { params }),

  getCategoryMenuV2: () =>
    apiClient.get('/api/v2/lecture/intro/category/menu'),

  getBannerV2: () =>
    apiClient.get('/api/v2/lecture/intro/banner'),

  getContentsLinkInfo: () =>
    apiClient.get('/api/v2/lecture/intro/link/contents-info'),

  getTrainingHallV2: (contents: string) =>
    apiClient.get(`/api/v2/lecture/training/hall/${contents}`),

  getTrainingContentsV2: (contentId: string) =>
    apiClient.get(`/api/v2/lecture/training/contents/${contentId}`),

  getAiTrainingContent: () =>
    apiClient.get('/api/v2/lecture/training/content/ai'),
};
