import type { ApiResponse } from './api';

export interface LectureCategory {
  name: string;
  code: string;
  summary?: string;
}

export interface CurriculumDetail {
  number: number;
  title: string;
  thumbnail: string;
  free: string;
  crr_detail: string;
}

export interface Curriculum {
  count: number;
  detail: CurriculumDetail[];
}

export interface ContentsBuy {
  order_no: string;
  subscription_start_date: string;
  subscription_end_date: string;
}

export interface LectureContents {
  idx: number;
  title: string;
  summary: string;
  description: string;
  thumbnail: string;
  category: LectureCategory;
  curriculum: Curriculum;
  is_option: boolean;
  is_buy: boolean;
  buy?: ContentsBuy;
  device: number;
  price_display_origin: string;
  price_display_sale: string;
  price_display_duration: string;
}

export interface ContentsNotice {
  idx: string;
  category: string;
  title: string;
  author: string;
  view: number;
  created_at: string;
}

export interface Banner {
  idx: number;
  title: string;
  image: string;
  link: string;
}

export interface BuildingFloor {
  no: number;
  id: string;
  name: string;
  description: string;
}

export interface Building {
  id: string;
  name: string;
}

export interface BuildingDetail extends Building {
  floor_cnt: number;
  floor: BuildingFloor[];
}

export interface BuildingFloorContents {
  id: string;
  title: string;
  description: string;
}

export interface BuildingFloorDetail {
  id: string;
  name: string;
  floor: BuildingFloor;
  contents: BuildingFloorContents[];
}

export interface TrainingContents {
  idx: number;
  title: string;
  url: string;
}

export type LectureContentsListResponse = ApiResponse<LectureContents[]>;
export type LectureContentsDetailResponse = ApiResponse<LectureContents>;
export type ContentsNoticeListResponse = ApiResponse<ContentsNotice[]>;
export type BannerListResponse = ApiResponse<Banner[]>;
export type CategoryFirstListResponse = ApiResponse<LectureCategory[]>;
export type CategorySecondListResponse = ApiResponse<LectureCategory[]>;
export type BuildingListResponse = ApiResponse<Building[]>;
export type BuildingDetailResponse = ApiResponse<BuildingDetail>;
export type BuildingFloorDetailResponse = ApiResponse<BuildingFloorDetail>;
export type TrainingContentsResponse = ApiResponse<TrainingContents>;
