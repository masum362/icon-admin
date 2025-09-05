import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getUsers(limit: number, selectedPage: number, role?: string) {
  const url = buildUrl("/api/v1/user", {
    limit: limit,
    page: selectedPage,
    sort: "name",
    role: role,
  });
  try {
    const response = await axiosInstance.get(url);
    return {
      data: response?.data?.data || [],
      total: response?.data?.data?.length || 0,
      page: selectedPage,
      limit: limit,
    };
  } catch (e) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: limit,
    };
  }
}

export const useUserList = (limit: number, selectedPage: number, role?: string) => {
  return useQuery({
    queryKey: ["user-list", limit, selectedPage, role],
    queryFn: () => getUsers(limit, selectedPage, role),
  });
};
