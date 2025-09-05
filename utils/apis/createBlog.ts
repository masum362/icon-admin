import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios";
import { toast } from "@/hooks/use-toast";

interface CreateBlogData {
  title: string;
  description: string;
  categoryId: string;
  createdBy: string;
  tags: string[];
  status: string;
  coverPhoto: string;
}

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlogData) => {
      const response = await axiosInstance.post("/blog/create-blog", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
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