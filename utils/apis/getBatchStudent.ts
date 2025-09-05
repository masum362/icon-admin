import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const useBatchStudentList = (limit: number, page: number) => {
  return useQuery({
    queryKey: ["batch-students", limit, page],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/batch-student?limit=${limit}&page=${page}`);
      return data;
    },
  });
}; 