import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const useOfflineBatchList = (courseId: string) => {
  return useQuery({
    queryKey: ["offline-batch", courseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/offline-batch?courseId=${courseId}`
      );
      return data;
    },
    enabled: !!courseId,
  });
};
