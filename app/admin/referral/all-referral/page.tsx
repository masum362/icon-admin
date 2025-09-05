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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  _id: string;
  referrerId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
  };
  referredUserId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
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
  purchaseTokenId: {
    _id: string;
    status: string;
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
}

const AllReferral = () => {
  const [referrals, setReferrals] = useState<any>({ data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null
  );
  const [rewardAmount, setRewardAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await axiosInstance.get("/refer-details");
        setReferrals(response.data);
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Unverified":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const handleGiveReward = async () => {
    if (!selectedReferral || !rewardAmount) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/refer-reward/create-refer-reward", {
        referDetailsId: selectedReferral._id,
        amount: Number(rewardAmount),
      });

      toast({
        title: "Success",
        description: "Reward given successfully",
      });

      // Reset form
      setRewardAmount("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error giving reward:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to give reward",
      });
    } finally {
      setIsSubmitting(false);
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
                All Referrals
              </h1>
            </div>
          </div>

          <div className="card mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Referred At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.data?.map((referral: Referral) => (
                    <TableRow key={referral._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {referral.referrerId?.name ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referrerId?.phone ?? "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {referral.referredUserId?.name ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referredUserId?.phone ?? "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {referral.courseId?.course_title ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ৳{referral.courseId?.price?.toLocaleString() ?? "0"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            referral.purchaseTokenId?.status ?? "Unverified"
                          )}`}
                        >
                          {referral.purchaseTokenId?.status ?? "Unverified"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {referral.purchaseTokenId?.paymentInfo?.method ??
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.purchaseTokenId?.paymentInfo
                              ?.accountNumber ?? "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.referredAt
                          ? moment(referral.referredAt).format(
                              "MMM DD, YYYY HH:mm"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReferral(referral)}
                            >
                              Give Reward
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Give Reward</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Referrer
                                </label>
                                <div className="text-sm text-gray-500">
                                  {selectedReferral?.referrerId?.name ?? "N/A"}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Course
                                </label>
                                <div className="text-sm text-gray-500">
                                  {selectedReferral?.courseId?.course_title ??
                                    "N/A"}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Reward Amount (৳)
                                </label>
                                <Input
                                  type="number"
                                  placeholder="Enter reward amount"
                                  value={rewardAmount}
                                  onChange={(e) =>
                                    setRewardAmount(e.target.value)
                                  }
                                />
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleGiveReward}
                                disabled={isSubmitting || !rewardAmount}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Giving Reward...
                                  </>
                                ) : (
                                  "Give Reward"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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

export default AllReferral;
