import axiosInstance from "../axios";

export const deleteInstructor = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/faculty/delete-faculty`, {
      data: {
        _id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 