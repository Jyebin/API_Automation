import apiClient from '@/client/apiClient';
import type {
  PromotionEventResponse,
  AttendResultResponse,
  MonthlyAttendResponse,
  AttendTicketResponse,
  PartiCountResponse,
  EventWinnerListResponse,
  DrawResponse,
} from '@/types/event.types';

export const eventApi = {
  getPromotion: () =>
    apiClient.get<PromotionEventResponse>('/api/v2/event/promotion'),

  attend: (event_idx: number | string) =>
    apiClient.post<AttendResultResponse>(`/api/v2/event/attend/${event_idx}`),

  getMonthlyAttend: (event_idx: number | string, params?: { year?: number; month?: number }) =>
    apiClient.get<MonthlyAttendResponse>(`/api/v2/event/attend/montly/${event_idx}`, { params }),

  getAttendHistory: (event_idx: number | string, body?: Record<string, unknown>) =>
    apiClient.post(`/api/v2/event/attend/history/${event_idx}`, body ?? {}),

  getAttendTicket: (event_idx: number | string) =>
    apiClient.get<AttendTicketResponse>(`/api/v2/event/attend/ticket/${event_idx}`),

  getPartiCount: (params?: { event_idx?: number }) =>
    apiClient.get<PartiCountResponse>('/api/v2/event/parti-count', { params }),

  draw: (event_idx: number | string) =>
    apiClient.get<DrawResponse>(`/api/v2/event/reward/${event_idx}/draw`),

  getWinners: (event_idx: number | string) =>
    apiClient.get<EventWinnerListResponse>(`/api/v2/event/reward/${event_idx}/winners`),
};
