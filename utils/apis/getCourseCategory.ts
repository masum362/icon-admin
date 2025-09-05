import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getCourseCategory(limit: number, selectedPage: number) {
  const url = buildUrl("/api/v1/courseCategory", {
    limit: limit,
    page: selectedPage,
    sort: "name",
  });
  try {
    const response = await axiosInstance.get(url);
    return response?.data;
  } catch (e) {
    return e;
  }
}

export const useCourseCategoryList = (limit: number, selectedPage: number) => {
  return useQuery({
    queryKey: ["course-category-list"],
    queryFn: () => getCourseCategory(limit, selectedPage),
  });
}; 