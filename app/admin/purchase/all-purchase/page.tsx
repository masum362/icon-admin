"use client";

import React, { useState, useEffect } from "react";
import { usePurchaseList } from "@/utils/apis/getPurchase";
import { updatePurchase } from "@/utils/apis/updatePurchase";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axios";

const AllPurchase = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const { data: purchases, isLoading, refetch } = usePurchaseList(1000, 1);

  // Fetch courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/course?page=1&limit=100");
        setCourses(response.data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

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

  const fetchFilteredPurchases = async () => {
    if (!startDate || !endDate) return;

    setIsLoadingFilter(true);
    try {
      const url = `/purchase/stats?startDate=${startDate}&endDate=${endDate}${
        selectedCourse && selectedCourse !== "all"
          ? `&courseSlug=${selectedCourse}`
          : ""
      }`;
      const response = await axiosInstance.get(url);
      if (response.data?.data) {
        setFilteredData(response.data);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching purchases",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoadingFilter(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredPurchases();
    } else {
      setFilteredData(null);
    }
  }, [startDate, endDate, selectedCourse]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
      await updatePurchase(id, { paymentStatus: newStatus });
      toast({
        title: "Payment status updated",
        description: `Status changed to ${newStatus}`,
      });
      refetch(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDownloadInvoice = (purchase: any) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate the invoice HTML content
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${purchase._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-total { text-align: right; margin-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>Invoice</h1>
            <p>Purchase ID: ${purchase._id}</p>
          </div>
          
          <div class="invoice-details">
            <h3>Student Information</h3>
            <p>Name: ${
              filteredData ? purchase.student?.name : purchase.studentId?.name
            }</p>
          </div>

          <div class="invoice-details">
            <h3>Course Information</h3>
            <p>Course: ${
              filteredData
                ? purchase.course?.course_title
                : purchase.courseId?.course_title
            }</p>
          </div>

          <div class="invoice-details">
            <h3>Payment Information</h3>
            <p>Transaction ID: ${
              filteredData
                ? purchase.purchaseToken
                : purchase.paymentInfo?.transactionId
            }</p>
            <p>Payment Method: ${
              filteredData
                ? purchase.paymentMethod
                : purchase.paymentInfo?.method
            }</p>
            <p>Payment Date: ${new Date(
              filteredData
                ? purchase.createdAt
                : purchase.paymentInfo?.paymentDate
            ).toLocaleDateString()}</p>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Course Fee</td>
                <td>৳${purchase.subtotal}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td>৳${purchase.discount}</td>
              </tr>
              <tr>
                <td>Additional Charges</td>
                <td>৳${purchase.charge}</td>
              </tr>
              <tr>
                <td><strong>Total Amount</strong></td>
                <td><strong>৳${purchase.totalAmount}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-total">
            <p><strong>Status: ${purchase.paymentStatus}</strong></p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Invoice</button>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  console.log("purchases", purchases);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Purchase list</h6>
            <p className="card-description">All Purchases Here</p>
          </div>
        </div>
        {/* Start All Purchase List Table */}
        <div className="p-3 sm:p-4">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div>
                {startDate && endDate && filteredData && (
                  <p>Total Purchases: {filteredData.data.length || 0}</p>
                )}
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
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      className="w-[200px] cursor-pointer"
                      onClick={(e) => e.currentTarget.showPicker()}
                      min={startDate || undefined}
                    />
                  </div>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course.slug}>
                          {course.course_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSelectedCourse("all");
                    refetch();
                  }}
                >
                  Clear Filter
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-table">
            {isLoadingFilter ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
                <thead>
                  <tr className="text-primary-500">
                    {/* <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Purchase ID
                    </th> */}
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Student
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Student Role
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Course
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Transaction ID
                    </th>
                    {/* <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Amount Details
                    </th> */}
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Payment Method
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Payment Date
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Proof
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Status
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Toggle Payment
                    </th>
                    <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {(filteredData?.data || purchases?.data)?.map(
                    (purchase: any) => (
                      <tr key={purchase._id}>
                        <td className="px-4 py-4">
                          {filteredData
                            ? purchase.student?.name
                            : purchase.studentId?.name}
                        </td>
                        <td className="px-4 py-4">
                          {filteredData
                            ? purchase.course?.prefix
                            : purchase.course?.prefix}
                        </td>
                        <td className="px-4 py-4">
                          {filteredData
                            ? purchase.course?.course_title
                            : purchase.courseId?.course_title}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <h6 className="leading-none text-heading font-semibold">
                              {filteredData
                                ? purchase.purchaseToken
                                : purchase.paymentInfo?.transactionId}
                            </h6>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-medium">
                              {filteredData
                                ? purchase.paymentMethod
                                : purchase.paymentInfo?.method}
                            </span>
                            <p className="text-sm text-gray-500">
                              {filteredData
                                ? purchase.paymentMedium
                                : purchase.paymentInfo?.paymentMedium}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {new Date(
                            filteredData
                              ? purchase.createdAt
                              : purchase.paymentInfo?.paymentDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          {(filteredData
                            ? purchase.proofUrl
                            : purchase.paymentInfo?.proofUrl) && (
                            <a
                              href={
                                filteredData
                                  ? purchase.proofUrl
                                  : purchase.paymentInfo?.proofUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600"
                            >
                              View Proof
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                purchase.isDeleted
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {purchase.isDeleted ? "Deleted" : purchase.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                purchase.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {purchase.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Switch
                            checked={purchase.paymentStatus === "Paid"}
                            onCheckedChange={() =>
                              handleStatusToggle(
                                purchase._id,
                                purchase.paymentStatus
                              )
                            }
                            className="data-[state=checked]:bg-[rgb(95_113_250)] data-[state=unchecked]:bg-[rgb(226_226_226)] [&>span]:bg-white"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(purchase)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download Invoice
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* End All Purchase List Table */}
      </div>
    </div>
  );
};

export default AllPurchase;
