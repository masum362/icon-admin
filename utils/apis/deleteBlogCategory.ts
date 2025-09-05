import axiosInstance from "../axios";

export const deleteBlogCategory = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/blog-category/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 