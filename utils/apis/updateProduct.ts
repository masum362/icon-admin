import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { useToast } from "@/hooks/use-toast";

interface UpdateProductData {
  title: string;
  description: string;
  trailer?: string;
  categoryId: string;
  status: string;
  price: number;
  offerPrice?: number;
  stock: string;
  coverPhoto: string;
  tags: string[];
}

export const useUpdateProduct = (productId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      const response = await axiosInstance.patch(`/product/${productId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
};
