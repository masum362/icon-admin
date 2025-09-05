"use client";

import React from "react";
import { useGetNoticeList } from "@/utils/apis/getNoticeList";
import { Loader2, FileText, AlertCircle, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import moment from "moment";

const AllNotice = () => {
  const { data: notices, isLoading, error } = useGetNoticeList();

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
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-medium">Error loading notices</p>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          {/* Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-black">All Notices</h1>
                <Link href="/admin/notice/create-notice">
                  <Button className="btn b-solid btn-primary-solid">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Notice
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Notices Table */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Notices
              </h2>
            </div>

            {notices?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notices found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Schedule Date</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices?.data?.map((notice: any) => (
                      <TableRow key={notice._id}>
                        <TableCell className="font-medium">
                          {notice.title}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {notice.message}
                        </TableCell>
                        <TableCell>
                          {moment(notice.scheduleDate).format('MMM DD, YYYY hh:mm A')}
                        </TableCell>
                        <TableCell>
                          {moment(notice.expiresAt).format('MMM DD, YYYY hh:mm A')}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              notice.isExpire
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {notice.isExpire ? "Expired" : "Active"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllNotice;