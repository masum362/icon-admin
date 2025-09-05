import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export const usePaymentList = (limit: number, page: number) => {
  return useQuery({
    queryKey: ["payments", limit, page],
    queryFn: async () => {
      const response = await axiosInstance.get(`/payment-details?limit=${limit}&page=${page}`);
      return response.data;
    },
  });
}; 