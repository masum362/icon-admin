import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

interface ProductCategory {
  _id: string;
  name: string;
  createdBy: string;
  description: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export const useGetProductCategory = () => {
  return useQuery({
    queryKey: ["productCategories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/product-category");
      return data;
    },
  });
}; 