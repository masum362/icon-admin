"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/utils/axios";
import moment from "moment";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    cover_photo: string;
    course_title: string;
    duration: string;
    prefix: string;
  };
  studentId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
  };
  batchId: string;
  paidAmont: number;
  paymentMethod: string;
  status: string;
  transctionId: string;
  paymentNumber: string;
  due: number;
  discount: number;
  discountReason: string;
  name: string;
  phone: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const AllEnrollment = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axiosInstance.get("/enrollment");
        setEnrollments(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch enrollments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">All Enrollments</h6>
            <p className="card-description">List of all course enrollments</p>
          </div>
          <Link href="/admin/enrollment/create-enrollment">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Enrollment
            </Button>
          </Link>
        </div>

        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No enrollments found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student Role</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full overflow-hidden bg-gray-100">
                            {enrollment.studentId.profile_picture ? (
                              <img
                                src={enrollment.studentId.profile_picture}
                                alt={enrollment.studentId.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                                {enrollment.studentId.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {enrollment.studentId.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {enrollment.studentId.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {enrollment?.courseId?.prefix}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg overflow-hidden">
                            <img
                              src={enrollment?.courseId?.cover_photo}
                              alt={enrollment?.courseId?.course_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {enrollment?.courseId?.course_title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {enrollment?.courseId?.duration}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ৳{enrollment.paidAmont}
                          </p>
                          {enrollment.due > 0 && (
                            <p className="text-sm text-red-500">
                              Due: ৳{enrollment.due}
                            </p>
                          )}
                          {enrollment.discount > 0 && (
                            <p className="text-sm text-green-500">
                              Discount: ৳{enrollment.discount}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {moment(enrollment.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEnrollment;
