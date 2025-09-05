import axiosInstance from "@/utils/axios";

export interface Withdraw {
  _id: string;
  referrerId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
  };
  amount: number;
  method: string;
  accountNo: string;
  paymentMedium: string;
  requestDate: string;
  approved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useGetWithdrawals = () => {
  const fetchWithdrawals = async () => {
    try {
      const response = await axiosInstance.get<Withdraw[]>('/withdraw');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch withdrawals");
    }
  };

  const approveWithdrawal = async (id: string) => {
    try {
      const response = await axiosInstance.put(`/withdraw/${id}`, { approved: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to approve withdrawal");
    }
  };

  const rejectWithdrawal = async (id: string) => {
    try {
      const response = await axiosInstance.put(`/withdraw/${id}`, { approved: false });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to reject withdrawal");
    }
  };

  return {
    fetchWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
  };
}; 