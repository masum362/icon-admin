import axiosInstance from "../axios";

export const deleteUser = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 