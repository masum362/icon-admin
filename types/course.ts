import { CourseCategory } from "./courseCategory";

export interface Course {
  _id: string;
  cover_photo: string;
  course_title: string;
  description: string;
  duration: string;
  preOrder: "on" | "off";
  course_type: string;
  category: CourseCategory;
  createdBy: string | null;
  expireTime: string;
  daySchedule: string[];
  timeShedule: string[];
  price: number;
  offerPrice: number;
  takeReview: "on" | "off";
  status: "active" | "inactive" | "draft";
  course_tag: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 