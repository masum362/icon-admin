import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface FillInTheGapsQuestion {
  _id: string;
  examId: string;
  question: string;
  answer: string;
  marks: number;
  status: "Drafted" | "Published";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  deletedAt?: string;
}

const fetchFillInTheGapsQuestions = async (examId: string) => {
  const response = await axiosInstance.get(`/gap-question/${examId}`);
  return response.data;
};

export const useGetFillInTheGapsQuestionList = (examId: string) => {
  return useQuery({
    queryKey: ["fillInTheGapsQuestions", examId],
    queryFn: () => fetchFillInTheGapsQuestions(examId),
    enabled: !!examId,
  });
}; 