import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";

export const useGetGapAttemptList = (studentId: string) => {
  return useQuery({
    queryKey: ["gapAttempts", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await axiosInstance.get(`/gap-attemp?studentId=${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
  });
}; 