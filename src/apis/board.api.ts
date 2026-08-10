import apiClient from '@/client/apiClient';
import type {
  NoticeCategoryListResponse,
  NoticeDetailResponse,
  FaqCategoryListResponse,
  FaqListResponse,
  BoardEventListResponse,
  BoardEventDetailResponse,
  DeviceListResponse,
  DeviceDetailResponse,
} from '@/types/board.types';

export const boardApi = {
  // ── 공지사항 (v1, PUBLIC) ─────────────────────────────────────────────
  getNoticeCategories: () =>
    apiClient.get<NoticeCategoryListResponse>('/api/v1/board/notice/whole/category'),

  getNoticeDetail: (board_id: number | string) =>
    apiClient.get<NoticeDetailResponse>(`/api/v1/board/notice/whole/${board_id}`),

  // ── FAQ (v1, PUBLIC) ──────────────────────────────────────────────────
  getFaqCategories: () =>
    apiClient.get<FaqCategoryListResponse>('/api/v1/board/faq/category'),

  getFaqs: (params?: { page?: number; size?: number; category?: string }) =>
    apiClient.get<FaqListResponse>('/api/v1/board/faq', { params }),

  // ── 이벤트 (v1, PUBLIC) ───────────────────────────────────────────────
  getBoardEvents: (params?: { page?: number; size?: number }) =>
    apiClient.get<BoardEventListResponse>('/api/v1/board/event', { params }),

  getBoardEventDetail: (event_id: number | string) =>
    apiClient.get<BoardEventDetailResponse>(`/api/v1/board/event/${event_id}`),

  // ── 디바이스 (v1, PUBLIC) ─────────────────────────────────────────────
  getDevices: () =>
    apiClient.get<DeviceListResponse>('/api/v1/board/device'),

  getDeviceDetail: (device_id: number | string) =>
    apiClient.get<DeviceDetailResponse>(`/api/v1/board/device/detail/${device_id}`),

  // ── 공지사항 (v2, PUBLIC) ─────────────────────────────────────────────
  getNoticeCategoriesV2: () =>
    apiClient.get('/api/v2/board/notice/whole/category'),

  getNoticeDetailV2: (noticeId: number | string) =>
    apiClient.get(`/api/v2/board/notice/whole/${noticeId}`),

  // ── 이벤트 (v2, PUBLIC) ───────────────────────────────────────────────
  getBoardEventsV2: (params?: { page?: number; size?: number }) =>
    apiClient.get('/api/v2/board/event', { params }),

  getBoardEventDetailV2: (eventId: number | string) =>
    apiClient.get(`/api/v2/board/event/${eventId}`),

  // ── 디바이스 (v2, PUBLIC) ─────────────────────────────────────────────
  getDevicesV2: () =>
    apiClient.get('/api/v2/board/device'),

  getDeviceDetailV2: (deviceId: number | string) =>
    apiClient.get(`/api/v2/board/device/detail/${deviceId}`),
};
