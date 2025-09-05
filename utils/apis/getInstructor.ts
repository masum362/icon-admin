import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getInstructor(limit: number, selectedPage: number) {
  const url = buildUrl("/api/v1/faculty", {
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

export const useInstructorList = (limit: number, selectedPage: number) => {
  return useQuery({
    queryKey: ["instructor-list"],
    queryFn: () => getInstructor(limit, selectedPage),
  });
}; 

async function getInstructorByRole(limit: number, selectedPage: number, role: string) {
  const url = buildUrl("/api/v1/user", {
    limit: limit,
    page: selectedPage,
    sort: "name",
    role: role,
  });
  try {
    const response = await axiosInstance.get(url);
    return response?.data;
  } catch (e) {
    return e;
  }
}

export const useInstructorListByRole = (limit: number, selectedPage: number, role: string) => {
  return useQuery({
    queryKey: ["instructor-list-by-role"],
    queryFn: () => getInstructorByRole(limit, selectedPage, role),
  });
}; 