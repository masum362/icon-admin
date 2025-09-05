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

interface Attendance {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
  };
  insertTime: string;
  batchStudent: {
    _id: string;
    batchId: {
      _id: string;
      name: string;
    };
    courseId: {
      _id: string;
      course_title: string;
    };
    studentId: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const AttendencePage = () => {
  const [attendances, setAttendances] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await axiosInstance.get("/attendance");
        setAttendances(response.data);
      } catch (error) {
        console.error("Error fetching attendances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendances();
  }, []);

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
                Attendance List
              </h1>
            </div>
          </div>

          <div className="card mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Attendance Time</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances?.data?.map((attendance: any) => (
                    <TableRow key={attendance._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {attendance.studentId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.studentId.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {attendance.batchStudent.batchId.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {attendance.batchStudent.courseId.course_title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {moment(attendance.insertTime).format("hh:mm A")}
                      </TableCell>
                      <TableCell>
                        {moment(attendance.insertTime).format("MMM DD, YYYY")}
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

export default AttendencePage;