import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../axios";

interface CQAttempt {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
  };
  examId: {
    _id: string;
    examTitle: string;
    examType: string;
  };
  questionId: {
    _id: string;
    question: string;
  };
  submitedPdf: string;
  submittedTime: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useGetCQAttemptList = (studentId: string) => {
  return useQuery({
    queryKey: ["cqAttempts", studentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/cq-attemp/?studentId=${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}; 