import type { ApiResponse } from './api';

export interface NoticeCategory {
  code: string;
  name: string;
}

export interface NoticeFile {
  path: string;
  org_name: string;
  save_name: string;
}

export interface NoticePrevNext {
  idx: number;
  title: string;
  author: string;
  created_at: string;
}

export interface Notice {
  idx: number;
  category: string;
  title: string;
  description: string;
  author: string;
  view: number;
  top: string;
  attachments?: NoticeFile;
  created_at: string;
  updated_at: string;
  prev?: NoticePrevNext;
  next?: NoticePrevNext;
}

export interface FaqCategory {
  code: string;
  name: string;
}

export interface Faq {
  idx: number;
  category: string;
  title: string;
  description: string;
  created_at: string;
}

export interface BoardEvent {
  idx: number;
  title: string;
  thumbnail: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface BoardEventDetail extends BoardEvent {
  description: string;
}

export interface Device {
  idx: number;
  name: string;
  thumbnail: string;
  description: string;
}

export type NoticeCategoryListResponse = ApiResponse<NoticeCategory[]>;
export type NoticeListResponse = ApiResponse<Notice[]>;
export type NoticeDetailResponse = ApiResponse<Notice>;
export type FaqCategoryListResponse = ApiResponse<FaqCategory[]>;
export type FaqListResponse = ApiResponse<Faq[]>;
export type BoardEventListResponse = ApiResponse<BoardEvent[]>;
export type BoardEventDetailResponse = ApiResponse<BoardEventDetail>;
export type DeviceListResponse = ApiResponse<Device[]>;
export type DeviceDetailResponse = ApiResponse<Device>;
