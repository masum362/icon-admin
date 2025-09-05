"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBatchStudentList } from "@/utils/apis/getBatchStudent";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const OfflineStudentList = () => {
  const [limit, setLimit] = useState(10);
  const [selectedPage, setSelectedPage] = useState<any>(1);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isFetching, isFetched, refetch } = useBatchStudentList(
    limit,
    selectedPage
  );

  const handleGenerateQR = async (studentId: string) => {
    try {
      const { data } = await axiosInstance.post("/qr-code/generate-qr", {
        studentId,
      });
      console.log(data?.data?.qrCode);
      setQrCode(data?.data?.qrCode);
      setIsQrModalOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating QR code",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/batch-student/${studentToDelete}`);
      toast({
        title: "Student deleted successfully",
        description: "The student has been removed.",
      });
      setStudentToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting student",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Offline Student list</h6>
            <p className="card-description">All Offline Students Here</p>
          </div>
          {/* <Link
            href="/admin/student/create-student"
            className="btn b-solid btn-primary-solid"
          >
            Add Student
          </Link> */}
        </div>
        {/* Start All Student List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            {isFetching ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
                <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                  <tr>
                    <th className="px-4 py-4">Student</th>
                    <th className="px-4 py-4">Batch</th>
                    <th className="px-4 py-4">Course</th>
                    <th className="px-4 py-4">Phone</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {data?.data?.length > 0 ? (
                    data.data.map((student: any) => (
                      <tr
                        key={student._id}
                        className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="size-12 rounded-50 overflow-hidden dk-theme-card-square">
                              <img
                                src={
                                  student.studentId?.profile_picture ||
                                  "/assets/images/student/student-1.png"
                                }
                                alt={student.studentId?.name || "Student"}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h6 className="leading-none text-heading font-semibold">
                                <div>
                                  {student.studentId?.name || "Unknown"}
                                </div>
                              </h6>
                              <p className="font-spline_sans text-sm font-light mt-1">
                                {student.studentId?.role || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {student.batchId?.name || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="size-12 rounded-50 overflow-hidden dk-theme-card-square">
                              <img
                                src={
                                  student.courseId?.cover_photo ||
                                  "/assets/images/course/default-cover.png"
                                }
                                alt={student.courseId?.course_title || "Course"}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h6 className="leading-none text-heading font-semibold">
                                {student.courseId?.course_title || "-"}
                              </h6>
                              <p className="font-spline_sans text-sm font-light mt-1">
                                {student.courseId?.duration || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {student.studentId?.phone || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="default"
                              onClick={() =>
                                student.studentId?._id &&
                                handleGenerateQR(student.studentId._id)
                              }
                              disabled={!student.studentId?._id}
                            >
                              Generate QR
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    setStudentToDelete(student._id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Student?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    student? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setStudentToDelete(null)}
                                    disabled={isDeleting}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteStudent}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        No offline students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* End All Student List Table */}
      </div>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={qrCode}
                  alt="Student QR Code"
                  className="w-64 h-64 object-contain"
                />
                <Button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Print QR Code</title>
                            <style>
                              body {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                              }
                              img {
                                width: 300px;
                                height: 300px;
                              }
                            </style>
                          </head>
                          <body>
                            <img src="${qrCode}" alt="Student QR Code" />
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                >
                  Print QR Code
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfflineStudentList;
