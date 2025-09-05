import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const useBlogList = (limit: number, page: number) => {
  return useQuery({
    queryKey: ["blogs", limit, page],
    queryFn: async () => {
      const response = await axiosInstance.get(`/blog?limit=${limit}&page=${page}`);
      return response.data;
    },
  });
}; 