import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

interface Product {
  _id: string;
  title: string;
  description: string;
  trailer: string;
  categoryId: {
    _id: string;
    name: string;
    description: string;
    slug: string;
  };
  status: string;
  price: number;
  offerPrice: number;
  stock: string;
  coverPhoto: string;
  createdBy: {
    _id: string;
    name: string;
    phone: string;
    role: string;
  };
  isDeleted: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export const useGetProduct = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/product");
      return data;
    },
  });
}; 