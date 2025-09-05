import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface Lecture {
  _id: string;
  courseId: {
    _id: string;
    cover_photo: string;
    course_title: string;
    description: string;
    duration: string;
    preOrder: string;
    course_type: string;
    category: any;
    createdBy: string;
    expireTime: string;
    daySchedule: string[];
    timeShedule: string[];
    price: number;
    offerPrice: number;
    takeReview: string;
    status: string;
    course_tag: string[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    __v: number;
    deletedAt?: string;
  };
  createdBy: any;
  moduleId: {
    _id: string;
    moduleTitle: string;
    courseId: string;
    createdBy: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    slug: string;
    __v: number;
  };
  title: string;
  server: string;
  videoId: string;
  duration: number;
  isFree: boolean;
  status: string;
  tags: string[];
  scheduleDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

export const getLectureList = async (moduleId: string) => {
  try {
    const response = await axiosInstance.get(`/lecture/${moduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useLectureList = (moduleId: string) => {
  return useQuery({
    queryKey: ["lectures", moduleId],
    queryFn: () => getLectureList(moduleId),
    enabled: !!moduleId,
  });
}; 