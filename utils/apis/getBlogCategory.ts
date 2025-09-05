import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const useBlogCategoryList = (limit: number, page: number) => {
  return useQuery({
    queryKey: ["blog-categories", limit, page],
    queryFn: async () => {
      const response = await axiosInstance.get(`/blog-category?limit=${limit}&page=${page}`);
      return response.data;
    },
  });
}; 