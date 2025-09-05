import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export const useGetNoticeList = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const response = await axiosInstance.get("/notice");
      return response.data;
    },
  });
}; 