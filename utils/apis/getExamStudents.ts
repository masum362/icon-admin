import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface ExamStudent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_picture: string;
  status: string;
  isDeleted: boolean;
  pin: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const fetchExamStudents = async (examId: string) => {
  const response = await axiosInstance.get(`exam/${examId}/students`);
  return response.data;
};

export const useExamStudents = (examId: string) => {
  return useQuery({
    queryKey: ["exam-students", examId],
    queryFn: () => fetchExamStudents(examId),
  });
}; 