import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface MCQQuestion {
  _id: string;
  examId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  status: "Drafted" | "Published";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  deletedAt?: string;
}

const fetchMCQQuestions = async (examId: string) => {
  const response = await axiosInstance.get(`/mcq/${examId}`);
  return response.data;
};

export const useGetMCQQuestionList = (examId: string) => {
  return useQuery({
    queryKey: ["mcqQuestions", examId],
    queryFn: () => fetchMCQQuestions(examId),
    enabled: !!examId,
  });
}; 