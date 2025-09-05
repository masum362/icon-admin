import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface CQQuestion {
  _id: string;
  examId: {
    _id: string;
    examTitle: string;
    courseId: string | null;
    moduleId: {
      _id: string;
      moduleTitle: string;
      slug: string;
    };
    examType: string;
    totalQuestion: number;
    positiveMark: number;
    negativeMark: number;
    mcqDuration: number;
    cqMark: number;
    status: string;
    slug: string;
  };
  createdBy: string | null;
  question: string;
  marks: number;
  status: "Drafted" | "Published";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  deletedAt?: string;
}

const fetchCQQuestions = async (examId: string) => {
  const response = await axiosInstance.get(`/cq-question/?examId=${examId}&sort=createdAt`);
  return response.data;
};

export const useGetCQQuestionList = (examId: string) => {
  return useQuery({
    queryKey: ["cqQuestions", examId],
    queryFn: () => fetchCQQuestions(examId),
    enabled: !!examId,
  });
}; 