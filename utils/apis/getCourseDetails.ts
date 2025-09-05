import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export const getCourseDetails = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/course/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useCourseDetails = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseDetails(id),
    enabled: !!id,
  });
};

export const useGetCourseDetails = (courseId: string) => {
  return useQuery({
    queryKey: ["course-details", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const { data } = await axiosInstance.get(`/course-details/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
}; 