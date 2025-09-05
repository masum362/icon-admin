"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import { Loader2, DollarSign, Package, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface PaymentInfo {
  transactionId: string;
  method: string;
  paymentDate: string;
}

interface Order {
  _id: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  paymentStatus: string;
  subTotal: number;
  discount: number;
  charge: number;
  shiping: number;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  paymentInfo: PaymentInfo;
}

interface IncomeReport {
  success: boolean;
  totalIncome: number;
  breakdown: {
    orderIncome: number;
    salesIncome: number;
    orderCount: number;
    salesCount: number;
  };
  details: {
    orders: Order[];
    sales: any[];
  };
}

const AllIncomeSales = () => {
  const [incomeData, setIncomeData] = useState<IncomeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      if (endDate && value > endDate) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "Start date cannot be greater than end date",
        });
        return;
      }
      setStartDate(value);
    } else {
      if (startDate && value < startDate) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "End date cannot be less than start date",
        });
        return;
      }
      setEndDate(value);
    }
  };

  const fetchIncomeReport = async () => {
    try {
      setIsLoading(true);
      let url = "/accounts/income-report";

      if (startDate && endDate) {
        url = `/accounts/income-report?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axiosInstance.get(url);
      setIncomeData(response.data);
    } catch (error) {
      console.error("Error fetching income report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch income report",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeReport();
  }, [startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Income Report
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Income</p>
                    <h3 className="text-2xl font-bold">
                      ৳{incomeData?.totalIncome?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order Income</p>
                    <h3 className="text-2xl font-bold">
                      ৳
                      {incomeData?.breakdown?.orderIncome?.toLocaleString() ||
                        0}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {incomeData?.breakdown?.orderCount || 0} Orders
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sales Income</p>
                    <h3 className="text-2xl font-bold">
                      ৳
                      {incomeData?.breakdown?.salesIncome?.toLocaleString() ||
                        0}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {incomeData?.breakdown?.salesCount || 0} Sales
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Order Details</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                          handleDateChange("start", e.target.value)
                        }
                        className="w-[200px] cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker()}
                        max={endDate || undefined}
                      />
                    </div>
                    <span>to</span>
                    <div className="relative">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                          handleDateChange("end", e.target.value)
                        }
                        className="w-[200px] cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker()}
                        min={startDate || undefined}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : incomeData?.details?.orders &&
                    incomeData.details.orders.length > 0 ? (
                    incomeData.details.orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary" />
                            {order.paymentInfo?.transactionId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.name}</div>
                            <div className="text-sm text-gray-500">
                              {order.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ৳{order.totalAmount?.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {order.paymentInfo?.method}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {moment(order.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Sales List Table */}
          <div className="card mt-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Sales Details</h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-table">
              <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
                <thead>
                  <tr className="text-primary-500">
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Transaction ID
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Amount
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Source
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      </td>
                    </tr>
                  ) : incomeData?.details?.sales &&
                    incomeData.details.sales.length > 0 ? (
                    incomeData.details.sales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary" />
                            {sale.purchaseId}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          ৳{sale.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 capitalize">{sale.source}</td>
                        <td className="px-4 py-4">
                          {moment(sale.createdAt).format("MMM DD, YYYY")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        No sales found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllIncomeSales;
