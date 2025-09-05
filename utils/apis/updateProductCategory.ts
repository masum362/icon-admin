import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";

interface UpdateProductCategoryData {
  name: string;
  description: string;
}

export const useUpdateProductCategory = (categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductCategoryData) => {
      const response = await axiosInstance.patch(`/product-category/${categoryId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productCategories"] });
    },
  });
}; 