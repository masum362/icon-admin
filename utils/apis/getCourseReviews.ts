import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export const useGetCourseReviews = (courseId: string) => {
  return useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data } = await axiosInstance.get(`/course-reveiw/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
}; 