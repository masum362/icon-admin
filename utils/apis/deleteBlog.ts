import axiosInstance from "../axios";

export const deleteBlog = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/blog/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 