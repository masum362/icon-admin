import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface Module {
  _id: string;
  moduleTitle: string;
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
  createdBy: {
    _id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    profile_picture: string;
    status: string;
    isDeleted: boolean;
    pin: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

export const getModuleList = async (courseId: string) => {
  try {
    const response = await axiosInstance.get(`/module/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useModuleList = (courseId: string) => {
  return useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => getModuleList(courseId),
    enabled: !!courseId,
  });
}; 

