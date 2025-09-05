"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import { useGetWithdrawals, Withdraw } from "@/utils/apis/getWithdrawals";
import axiosInstance from "@/utils/axios";

const AllWithdrawPage = () => {
  const [withdrawals, setWithdrawals] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { fetchWithdrawals } = useGetWithdrawals();

  const loadWithdrawals = async () => {
    try {
      const data = await fetchWithdrawals();
      setWithdrawals(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      setProcessingId(id);
      await axiosInstance.patch(`/withdraw/${id}`, {
        approved: !currentStatus
      });
      
      toast({
        title: "Success",
        description: `Withdrawal request ${!currentStatus ? 'approved' : 'rejected'} successfully`,
      });
      
      loadWithdrawals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">All Withdrawals</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Account No</TableHead>
                  <TableHead>Payment Medium</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals?.data?.map((withdraw: any) => (
                  <TableRow key={withdraw._id}>
                    <TableCell>{withdraw.referrerId.name}</TableCell>
                    <TableCell>{withdraw.referrerId.phone}</TableCell>
                    <TableCell>৳{withdraw.amount}</TableCell>
                    <TableCell className="capitalize">{withdraw.method}</TableCell>
                    <TableCell>{withdraw.accountNo}</TableCell>
                    <TableCell className="capitalize">{withdraw.paymentMedium}</TableCell>
                    <TableCell>{moment(withdraw.requestDate).format('DD MMM YYYY, h:mm A')}</TableCell>
                    <TableCell>
                      {withdraw.approved ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center text-red-300">
                          <XCircle className="h-4 w-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={withdraw.approved ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleApproval(withdraw._id, withdraw.approved)}
                        disabled={processingId === withdraw._id}
                      >
                        {processingId === withdraw._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : withdraw.approved ? (
                          "Reject"
                        ) : (
                          "Approve"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllWithdrawPage;
