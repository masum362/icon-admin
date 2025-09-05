"use client";

import React, { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import moment from "moment";

interface PurchaseToken {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
  };
  courseId: {
    _id: string;
    cover_photo: string;
    course_title: string;
    description: string;
    duration: string;
    category: string | null;
    price: number;
    offerPrice: number;
  };
  status: string;
  price: number;
  subtotal: number;
  discount: number;
  charge: number;
  totalAmount: number;
  paymentInfo: {
    transactionId: string;
    method: string;
    accountNumber: string;
    paymentMedium: string;
    proofUrl: string;
    paymentDate: string;
  };
  name: string;
  phone: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  purchaseToken: string;
}

const AllPurchaseTokenContent = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortField, setSortField] = React.useState("createdAt");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [userId, setUserId] = React.useState<string | null>(null);

  const {
    data: purchaseTokens,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["purchaseTokens"],
    queryFn: async () => {
      const response = await axiosInstance.get("/purchase-token");
      return response?.data?.data;
    },
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserId(response.data.data._id);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchUser();
  }, []);

  const filteredTokens = React.useMemo(() => {
    if (!purchaseTokens) return [];

    return purchaseTokens
      .filter((token: PurchaseToken) => {
        const matchesSearch =
          token.purchaseToken
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.phone.includes(searchTerm) ||
          token.courseId.course_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || token.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a: PurchaseToken, b: PurchaseToken) => {
        const aValue = a[sortField as keyof PurchaseToken];
        const bValue = b[sortField as keyof PurchaseToken];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
  }, [purchaseTokens, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusToggle = async (
    id: string,
    currentStatus: string,
    token: PurchaseToken
  ) => {
    if (!userId) return; // Don't proceed if userId is not loaded
    try {
      await axiosInstance.post("/purchase/create-purchase", {
        studentId: token.studentId._id,
        paymentStatus: "Paid",
        purchaseToken: token._id,
        issuedBy: userId,
      });
      toast({
        title: "Purchase created",
        description: `Purchase created for token ${token.purchaseToken}`,
      });
      refetch(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating purchase",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 text-lg font-medium">
            Error loading purchase tokens
          </p>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Purchase Token List</h6>
            <p className="card-description">All Purchase Tokens Here</p>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by token, name, phone, or course..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
              <thead>
                <tr className="text-primary-500">
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Purchase Token
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Student
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
                    Toggle Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredTokens.map((token: PurchaseToken) => (
                  <tr key={token._id}>
                    <td className="px-4 py-4">
                      <div>
                        <h6 className="leading-none text-heading font-semibold">
                          {token.purchaseToken || "N/A"}
                        </h6>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{token.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">
                          {token.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">
                          {token.courseId?.course_title || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {token.courseId?.duration || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <h6 className="leading-none text-heading font-semibold">
                          {token.paymentInfo?.transactionId || "N/A"}
                        </h6>
                      </div>
                    </td>
                    {/* <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-semibold">
                            ৳{token.subtotal || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Discount:</span>
                          <span className="font-semibold">
                            ৳{token.discount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Charge:</span>
                          <span className="font-semibold">
                            ৳{token.charge || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total:</span>
                          <span className="font-semibold">
                            ৳{token.totalAmount || 0}
                          </span>
                        </div>
                      </div>
                    </td> */}
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-medium">
                          {token.paymentInfo?.method || "N/A"}
                        </span>
                        <p className="text-sm text-gray-500">
                          {token.paymentInfo?.paymentMedium || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {token.paymentInfo?.paymentDate
                        ? moment(token.paymentInfo.paymentDate).format(
                            "MMM DD, YYYY hh:mm A"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      {token.paymentInfo?.proofUrl ? (
                        <a
                          href={token.paymentInfo.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          View Proof
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          token.status === "Verified"
                            ? "bg-green-100 text-green-800"
                            : token.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {token.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Switch
                        checked={token.status === "Verified"}
                        onCheckedChange={() =>
                          handleStatusToggle(
                            token._id,
                            token.status || "Pending",
                            token
                          )
                        }
                        className="data-[state=checked]:bg-[rgb(95_113_250)] data-[state=unchecked]:bg-[rgb(226_226_226)] [&>span]:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllPurchaseToken = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AllPurchaseTokenContent />
    </Suspense>
  );
};

export default AllPurchaseToken;
