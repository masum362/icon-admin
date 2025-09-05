import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { useToast } from "@/hooks/use-toast";

interface CreateProductData {
  title: string;
  description: string;
  trailer?: string;
  categoryId: string;
  status: string;
  price: number;
  offerPrice?: number;
  stock: string;
  coverPhoto: string;
  createdBy: string;
  tags: string[];
}

export const useCreateProduct = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const response = await axiosInstance.post(
        "/product/create-product/",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
};
