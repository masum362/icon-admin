import axiosInstance from "../axios";

export const updatePurchase = async (id: string, data: { paymentStatus: string }) => {
  try {
    const response = await axiosInstance.patch(`/purchase/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 