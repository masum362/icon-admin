import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getUniversityList(limit?: number, selectedPage?: number) {
  const url = buildUrl("/api/v1/university", {
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

export const useUniversityList = (limit?: number, selectedPage?: number) => {
  return useQuery({
    queryKey: ["university-list", limit, selectedPage],
    queryFn: () => getUniversityList(limit, selectedPage),
  });
}; 