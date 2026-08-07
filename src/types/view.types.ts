import type { ApiResponse } from './api';

export interface StudySummary {
  total: number;
  completed: number;
  in_progress: number;
}

export interface CalendarItem {
  date: string;
  contents_id: string;
  title: string;
  duration: number;
}

export interface QnaItem {
  idx: number;
  title: string;
  content: string;
  author: string;
  is_answered: boolean;
  created_at: string;
}

export interface QnaDetail extends QnaItem {
  answer?: string;
  answered_at?: string;
}

export interface QnaCreateBody {
  title: string;
  content: string;
  contents_id?: string;
  class_code?: string;
}

export interface Badge {
  idx: number;
  name: string;
  image: string;
  description: string;
  issued_at?: string;
}

export interface BadgeDetail extends Badge {
  criteria: string;
  category: string;
}

export type StudySummaryResponse = ApiResponse<StudySummary>;
export type CalendarListResponse = ApiResponse<CalendarItem[]>;
export type QnaListResponse = ApiResponse<QnaItem[]>;
export type QnaDetailResponse = ApiResponse<QnaDetail>;
export type QnaCreateResponse = ApiResponse<{ idx: number }>;
export type BadgeListResponse = ApiResponse<Badge[]>;
export type BadgeDetailResponse = ApiResponse<BadgeDetail>;
export type CertificateResponse = ApiResponse<{ url: string }>;
