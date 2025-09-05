import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface Exam {
  _id: string;
  examTitle: string;
  createdBy: string | null;
  courseId: string | null;
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
  examType: string;
  totalQuestion: number;
  positiveMark: number;
  negativeMark: number;
  mcqDuration: number;
  cqMark: number;
  status: string;
  scheduleDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

const fetchExams = async (moduleId: string) => {
  const response = await axiosInstance.get(`exam/${moduleId}`);
  return response.data;
};

export const useExamList = (moduleId: string) => {
  return useQuery({
    queryKey: ["exams", moduleId],
    queryFn: () => fetchExams(moduleId),
  });
}; 