import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getCourseList(limit: number, selectedPage: number) {
  const url = buildUrl("/api/v1/course", {
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

export const useCourseList = (limit: number, selectedPage: number) => {
  return useQuery({
    queryKey: ["course-list", limit, selectedPage],
    queryFn: () => getCourseList(limit, selectedPage),
  });
}; 