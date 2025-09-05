import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getPurchases(limit: number, selectedPage: number) {
  const url = buildUrl("/api/v1/purchase", {
    limit: limit,
    page: selectedPage,
    sort: "createdAt",
  });
  try {
    const response = await axiosInstance.get(url);
    return response?.data;
  } catch (e) {
    return e;
  }
}

export const usePurchaseList = (limit: number, selectedPage: number) => {
  return useQuery({
    queryKey: ["purchase-list"],
    queryFn: () => getPurchases(limit, selectedPage),
  });
}; 