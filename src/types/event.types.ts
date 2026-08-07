import type { ApiResponse } from './api';

export interface PromotionEvent {
  idx: number;
  title: string;
  thumbnail: string;
  start_date: string;
  end_date: string;
  link: string;
}

export interface AttendResult {
  is_attended: boolean;
  total_count: number;
  streak: number;
}

export interface MonthlyAttend {
  date: string;
  is_attended: boolean;
}

export interface AttendTicket {
  count: number;
}

export interface EventWinner {
  nickname: string;
  reward: string;
  won_at: string;
}

export interface PartiCount {
  count: number;
}

export type PromotionEventResponse = ApiResponse<PromotionEvent[]>;
export type AttendResultResponse = ApiResponse<AttendResult>;
export type MonthlyAttendResponse = ApiResponse<MonthlyAttend[]>;
export type AttendTicketResponse = ApiResponse<AttendTicket>;
export type PartiCountResponse = ApiResponse<PartiCount>;
export type EventWinnerListResponse = ApiResponse<EventWinner[]>;
export type DrawResponse = ApiResponse<{ reward: string }>;
