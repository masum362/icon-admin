import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const useBlogDetails = (id: string) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/blog/${id}`);
      return response.data;
    },
  });
}; 