import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";

interface CreateProductCategoryData {
  name: string;
  description: string;
  createdBy: string;
}

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductCategoryData) => {
      const response = await axiosInstance.post("/product-category/cretae-product-category", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
  });
}; 