import apiClient from '@/client/apiClient';
import type {
  StudySummaryResponse,
  CalendarListResponse,
  QnaListResponse,
  QnaDetailResponse,
  QnaCreateResponse,
  QnaCreateBody,
  BadgeListResponse,
  BadgeDetailResponse,
  CertificateResponse,
} from '@/types/view.types';

export const viewApi = {
  // ── 검증 (PUBLIC) ─────────────────────────────────────────────────────
  verifyView: (params: Record<string, string>) =>
    apiClient.get('/api/v1/view/verification', { params }),

  // ── 대시보드 (v1, AUTH) ───────────────────────────────────────────────
  getStudySummary: (params?: Record<string, string>) =>
    apiClient.get<StudySummaryResponse>('/api/v1/view/dashboard/study', { params }),

  getCalendar: (params?: Record<string, string>) =>
    apiClient.get<CalendarListResponse>('/api/v1/view/dashboard/calendar', { params }),

  getMyCalendar: (params?: Record<string, string>) =>
    apiClient.get<CalendarListResponse>('/api/v1/view/dashboard/calendar/my', { params }),

  // ── Q&A 게시판 (v1, AUTH) ─────────────────────────────────────────────
  getQnaList: (params?: { page?: number; size?: number; class_code?: string }) =>
    apiClient.get<QnaListResponse>('/api/v1/view/dashboard/board/qna', { params }),

  createQna: (body: QnaCreateBody) =>
    apiClient.post<QnaCreateResponse>('/api/v1/view/dashboard/board/qna', body),

  getQnaDetail: (qna_id: number | string) =>
    apiClient.get<QnaDetailResponse>(`/api/v1/view/dashboard/board/qna/${qna_id}`),

  updateQna: (qna_id: number | string, body: QnaCreateBody) =>
    apiClient.put(`/api/v1/view/dashboard/board/qna/${qna_id}`, body),

  deleteQna: (qna_id: number | string) =>
    apiClient.delete(`/api/v1/view/dashboard/board/qna/${qna_id}`),

  answerQna: (qna_id: number | string, body: { answer: string }) =>
    apiClient.post(`/api/v1/view/dashboard/board/qna/${qna_id}/answer`, body),

  // ── 배지 (v1, AUTH) ───────────────────────────────────────────────────
  getBadgeList: (params?: { page?: number; size?: number }) =>
    apiClient.get<BadgeListResponse>('/api/v1/view/badge/list', { params }),

  getBadgeDetail: (badge_id: number | string) =>
    apiClient.get<BadgeDetailResponse>(`/api/v1/view/badge/${badge_id}`),

  addBadgeFavorite: (badge_id: number | string) =>
    apiClient.post('/api/v1/view/badge/favorites', { badge_id }),

  getBadgeCertificate: (badge_id: number | string) =>
    apiClient.get<CertificateResponse>(`/api/v1/view/badge/certificate/${badge_id}`),

  // ── 대시보드 (v2, AUTH) ───────────────────────────────────────────────
  getStudySummaryV2: (params?: Record<string, string>) =>
    apiClient.get('/api/v2/view/dashboard/study', { params }),

  getCalendarV2: (params?: Record<string, string>) =>
    apiClient.get('/api/v2/view/dashboard/calendar', { params }),

  // ── Q&A 게시판 (v2, AUTH) ─────────────────────────────────────────────
  getQnaListV2: (params?: { page?: number; size?: number; class_code?: string }) =>
    apiClient.get('/api/v2/view/dashboard/board/qna', { params }),

  createQnaV2: (body: QnaCreateBody) =>
    apiClient.post('/api/v2/view/dashboard/board/qna', body),

  getQnaDetailV2: (qnaId: number | string) =>
    apiClient.get(`/api/v2/view/dashboard/board/qna/${qnaId}`),

  updateQnaV2: (qnaId: number | string, body: QnaCreateBody) =>
    apiClient.put(`/api/v2/view/dashboard/board/qna/${qnaId}`, body),

  deleteQnaV2: (qnaId: number | string) =>
    apiClient.delete(`/api/v2/view/dashboard/board/qna/${qnaId}`),

  // ── 배지 (v2, AUTH) ───────────────────────────────────────────────────
  getBadgeListV2: (params?: { page?: number; size?: number }) =>
    apiClient.get('/api/v2/view/badge/list', { params }),

  getBadgeDetailV2: (badgeId: number | string) =>
    apiClient.get(`/api/v2/view/badge/${badgeId}`),
};
