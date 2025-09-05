import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export const useGetLiveClasses = (courseId: string) => {
  return useQuery({
    queryKey: ["live-classes", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data } = await axiosInstance.get(`/live-class?courseId=${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
}; 