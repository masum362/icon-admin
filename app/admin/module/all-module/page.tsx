"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// import { useCourseList } from "@/utils/apis/getCourseList";
import { useModuleAllList } from "@/utils/apis/getModuleAllList";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { Course } from "@/types/course";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  DollarSign,
  Percent,
  CalendarClock,
  CheckCircle,
  XCircle,
  List,
  Plus,
  Edit,
  Trash2,
  Star,
  Video,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import { useUniversityList } from "@/utils/apis/getUniversityList";

const AllModule = () => {
  // const [limit, setLimit] = useState(100);
  // const [selectedPage, setSelectedPage] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  // const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data, isFetching, refetch } = useModuleAllList();
  const [isAuthorised, setIsAuthorised] = useState(false);
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserProfile(response?.data?.data);
        const role = response?.data?.data?.role;
        if (role === "admin" || role === "superAdmin") {
          setIsAuthorised(true);
        } else {
          setIsAuthorised(false);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "module" | "liveClass" | "offlineBatch" | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);


  const handleDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    setIsDeleting(true);
    try {
      if (deleteType === "module") {
        await axiosInstance.delete(`/module/${itemToDelete.slug}`);
        toast({
          title: "Success",
          description: "Module deleted successfully",
        });
        // Refetch modules
        refetch();
      } else if (deleteType === "liveClass") {
        await axiosInstance.delete(`/live-class/${itemToDelete.slug}`);
        toast({
          title: "Success",
          description: "Live class deleted successfully",
        });
        // Refetch live classes
      } else if (deleteType === "offlineBatch") {
        await axiosInstance.delete(`/offline-batch/${itemToDelete.slug}`);
        toast({
          title: "Success",
          description: "Offline batch deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete",
      });
    } finally {
      setIsDeleting(false);
      setDeleteType(null);
      setItemToDelete(null);
    }
  };
  console.log(data?.data[0]);
  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        {/* course module */}
        <div className="card mt-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <List className="h-5 w-5 mr-2" />
              Course Modules
            </h2>
            {isAuthorised && (
              <Link
                href={`/admin/module/create-module`}
              >
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Module
                </Button>
              </Link>
            )}
          </div>

          {isFetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No modules found for this course
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module Title</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    {isAuthorised && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((module: any) => (
                    <TableRow key={module._id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/course/module/${module._id}?courseId=${module?.courseId?._id}&&moduleName=${module.moduleTitle}`}
                        >
                          {module.moduleTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {module.createdBy?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {moment(module.createdAt).format("MMM DD, YYYY")}
                      </TableCell>
                      {isAuthorised && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/module/create-module?id=${module._id}&&courseId=${module?.courseId?._id}&moduleslug=${module.slug}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setDeleteType("module");
                                setItemToDelete(module);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteType}
        onOpenChange={(open) => !open && setDeleteType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteType === "module"
                ? "module"
                : deleteType === "liveClass"
                  ? "live class"
                  : "offline batch"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default AllModule;
