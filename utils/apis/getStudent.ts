import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getStudent(limit: number, selectedPage: number) {
  const url = buildUrl("/api/v1/student", {
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

export const useStudentList = (limit: number, selectedPage: number) => {
  return useQuery({
    queryKey: ["student-list"],
    queryFn: () => getStudent(limit, selectedPage),
  });
};
