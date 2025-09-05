"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import { Loader2, Receipt, DollarSign, Pencil, Trash2 } from "lucide-react";
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
import { useRouter } from "next/navigation";

interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  addedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  deletedAt?: string;
}

interface ExpenseReport {
  success: boolean;
  totalExpense: number;
  count: number;
  expenses: Expense[];
}

const AllExpense = () => {
  const [expenseData, setExpenseData] = useState<ExpenseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();
  const router = useRouter();

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

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      let url = "/accounts/expence-report";

      if (startDate && endDate) {
        url = `/accounts/expence-report?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axiosInstance.get(url);
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expense report",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/accounts/delete-expense/${slug}`);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      fetchExpenses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete expense",
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate]);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electricity":
        return "bg-blue-100 text-blue-800";
      case "rent":
        return "bg-green-100 text-green-800";
      case "salary":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
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
                Expense Report
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Expense</p>
                    <h3 className="text-2xl font-bold">
                      ৳{expenseData?.totalExpense?.toLocaleString() || 0}
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
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <h3 className="text-2xl font-bold">
                      {expenseData?.count || 0}
                    </h3>
                    <p className="text-sm text-gray-500">Expense Records</p>
                  </div>
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Expense Details</h2>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : expenseData?.expenses &&
                    expenseData.expenses.length > 0 ? (
                    expenseData.expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Receipt className="h-4 w-4 mr-2 text-primary" />
                            {expense.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                              expense.category
                            )}`}
                          >
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          ৳{expense.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {expense.paymentMethod}
                        </TableCell>
                        <TableCell>
                          {moment(expense.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/admin/accounts/create-expense?slug=${expense.slug}`
                                )
                              }
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense.slug)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllExpense;
