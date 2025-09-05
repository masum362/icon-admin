import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../axios";

interface MCQAttempt {
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

export const useGetMCQAttemptList = (studentId: string) => {
  return useQuery({
    queryKey: ["mcqAttempts", studentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/mcq-attemp/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}; 