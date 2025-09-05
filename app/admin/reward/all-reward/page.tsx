"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Loader2 } from "lucide-react";
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

interface Reward {
  _id: string;
  referDetailsId: {
    _id: string;
    referrerId: {
      _id: string;
      name: string;
      phone: string;
      role: string;
      profile_picture: string;
    };
    referredUserId: string;
    courseId: {
      _id: string;
      course_title: string;
      duration: string;
      price: number;
    };
    purchaseTokenId: {
      _id: string;
      studentId: string;
      status: string;
      ref: string;
      price: number;
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
    };
    referredAt: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  amount: number;
  isPaid: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const AllReward = () => {
  const [rewards, setRewards] = useState<any>({ data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axiosInstance.get("/refer-reward");
        setRewards(response.data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch rewards",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, [toast]);

  const handleMarkAsPaid = async (rewardId: string) => {
    try {
      await axiosInstance.patch(`/refer-reward/${rewardId}`, {
        isPaid: true,
      });

      // Update local state
      setRewards((prev: any) => ({
        ...prev,
        data: prev.data.map((reward: Reward) =>
          reward._id === rewardId ? { ...reward, isPaid: true } : reward
        ),
      }));

      toast({
        title: "Success",
        description: "Reward marked as paid",
      });
    } catch (error) {
      console.error("Error marking reward as paid:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark reward as paid",
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

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                All Rewards
              </h1>
            </div>
          </div>

          <div className="card mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards?.data?.map((reward: Reward) => (
                    <TableRow key={reward._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reward.referDetailsId.referrerId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reward.referDetailsId.referrerId.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reward.referDetailsId.courseId.course_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ৳{reward.referDetailsId.courseId.price.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ৳{reward.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reward.isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {reward.isPaid ? "Paid" : "Unpaid"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {moment(reward.createdAt).format("MMM DD, YYYY HH:mm")}
                      </TableCell>
                      <TableCell>
                        {!reward.isPaid && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(reward._id)}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReward;