import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { toast } from "@/hooks/use-toast";

interface CreateBlogCategoryData {
  title: string;
  createdBy: string;
}

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlogCategoryData) => {
      const response = await axiosInstance.post("/blog-category", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });
}; 