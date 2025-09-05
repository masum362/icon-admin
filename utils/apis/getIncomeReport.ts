import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { buildUrl } from "../urlBuilder";

async function getIncomeReport() {
  const url = buildUrl("/api/v1/accounts/income-report", {});
  try {
    const response = await axiosInstance.get(url);
    return response?.data;
  } catch (e) {
    return e;
  }
}

export const useIncomeReport = () => {
  return useQuery({
    queryKey: ["income-report"],
    queryFn: () => getIncomeReport(),
  });
}; 