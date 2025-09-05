"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCourseDetails } from "@/utils/apis/getCourseDetails";
import { useModuleList } from "@/utils/apis/getModuleList";
import { useGetCourseReviews } from "@/utils/apis/getCourseReviews";
import { useGetLiveClasses } from "@/utils/apis/getLiveClasses";
import { useOfflineBatchList } from "@/utils/apis/getOfflineBatch";
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
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from "moment";
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
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";

const days = [
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const CourseDetailsContent = () => {
  const params = useParams();
  const courseId = params.id as string;
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useCourseDetails(courseId);
  const course = courseData?.data;

  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        const role = response?.data?.data?.role;
        if (role === "admin" || role === "superAdmin") {
          setIsAuthorised(true);
        } else {
          setIsAuthorised(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile",
        });
        setIsAuthorised(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Only fetch modules when we have the course _id
  const {
    data: moduleData,
    isLoading: isModuleLoading,
    error: moduleError,
    refetch,
  } = useModuleList(course?._id || "");

  const { data: reviews, isLoading: isReviewsLoading } = useGetCourseReviews(
    course?._id || ""
  );
  const {
    data: liveClasses,
    isLoading: isLiveClassesLoading,
    refetch: refetchLiveClasses,
  } = useGetLiveClasses(course?._id || "");

  // Offline Batch
  const {
    data: offlineBatchData,
    isLoading: isOfflineBatchLoading,
    error: offlineBatchError,
    refetch: refetchOfflineBatch,
  } = useOfflineBatchList(course?._id || "");
  const offlineBatches = offlineBatchData?.data || [];

  console.log("moduleData", moduleData);
  const modules = moduleData?.data || [];
  const { toast } = useToast();
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
        refetchLiveClasses();
      } else if (deleteType === "offlineBatch") {
        await axiosInstance.delete(`/offline-batch/${itemToDelete.slug}`);
        toast({
          title: "Success",
          description: "Offline batch deleted successfully",
        });
        refetchOfflineBatch();
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

  if (isCourseLoading || isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-medium">
            Error loading course details
          </p>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">Course not found</p>
          <p className="text-gray-500 mt-2">
            The requested course does not exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-full lg:col-span-8">
          {/* Course Header */}
          <div className="card overflow-hidden">
            {course.cover_photo && (
              <div className="relative h-64 w-full">
                <img
                  src={course.cover_photo}
                  alt={course.course_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {course.course_title}
                  </h1>
                  <div className="flex items-center mt-2">
                    <span className="px-3 py-1 bg-primary/80 rounded-full text-sm font-medium">
                      {course.course_type}
                    </span>
                    <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                      {course.category?.title}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!course.cover_photo && (
              <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {course.course_title}
                </h1>
                <div className="flex items-center mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
                    {course.course_type}
                  </span>
                  <span className="ml-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    {course.category?.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Course Description */}
          <div className="card mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Course Description
            </h2>
            <div
              className="prose prose-sm sm:prose lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>

          {/* Course Schedule */}
          <div className="card mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CalendarClock className="h-5 w-5 mr-2 text-primary" />
              Course Schedule
            </h2>
            <div>
              {course?.routine && course?.routine != "" ? (
                <img className="w-full" src={course?.routine} alt="Routine" />
              ) : (
                "No class routine found!"
              )}
            </div>
          </div>
          {/* {(course.daySchedule?.length > 0 ||
            course.timeShedule?.length > 0) && (
            <div className="card mt-6 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-primary" />
                Course Schedule
              </h2>

              <div className="border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-4">
                  <span className="text-base font-semibold">Day</span>
                  <span className="text-base font-semibold">Time</span>
                </div>
                {course.daySchedule?.map((dayValue: string) => {
                  const dailyTimesEntry = course.timeShedule?.find(
                    (item: any) =>
                      Object.prototype.hasOwnProperty.call(item, dayValue)
                  );
                  const times = dailyTimesEntry
                    ? dailyTimesEntry[dayValue]
                    : ["", ""];

                  return (
                    <div
                      key={dayValue}
                      className="grid grid-cols-2 gap-4 items-center py-2 border-b last:border-b-0"
                    >
                      <div>
                        <span className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md text-sm font-medium">
                          {dayValue.charAt(0).toUpperCase() + dayValue.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {times && times.length === 2 ? (
                          <>
                            <span className="text-sm text-gray-700">
                              <span className="font-semibold">Start:</span>{" "}
                              {moment(times[0], "HH:mm").format("hh:mm A") ||
                                "N/A"}
                            </span>
                            <span className="text-sm text-gray-700">
                              <span className="font-semibold">End:</span>{" "}
                              {moment(times[1], "HH:mm").format("hh:mm A") ||
                                "N/A"}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No time scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Course Tags */}
          {course.course_tag && course.course_tag.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                Course Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.course_tag.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Course Modules */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <List className="h-5 w-5 mr-2 text-primary" />
                Course Modules
              </h2>
              {isAuthorised && (
                <Link
                  href={`/admin/course/create-module?courseId=${course?._id}`}
                >
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Module
                  </Button>
                </Link>
              )}
            </div>

            {isModuleLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : moduleError ? (
              <div className="text-center py-8 text-red-500">
                Error loading modules
              </div>
            ) : modules.length === 0 ? (
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
                    {modules.map((module: any) => (
                      <TableRow key={module._id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/course/module/${module._id}?courseId=${course?._id}&&moduleName=${module.moduleTitle}`}
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
                                href={`/admin/course/create-module?id=${module._id}&&courseId=${course?._id}&moduleslug=${module.slug}`}
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

          {/* Live Classes */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Video className="h-5 w-5 mr-2 text-primary" />
                Live Classes
              </h2>
              {isAuthorised && (
                <Link
                  href={`/admin/course/create-live-class?courseId=${course?._id}`}
                >
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Live Class
                  </Button>
                </Link>
              )}
            </div>

            {isLiveClassesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !liveClasses?.data?.length ? (
              <div className="text-center py-8 text-gray-500">
                No live classes found for this course
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      {isAuthorised && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveClasses?.data?.map((liveClass: any) => (
                      <TableRow key={liveClass._id}>
                        <TableCell className="font-medium">
                          {liveClass.title}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              liveClass.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {liveClass.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {moment(liveClass.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                        {isAuthorised && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/course/create-live-class?id=${liveClass?.slug}&&courseId=${course?._id}`}
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
                                  setDeleteType("liveClass");
                                  setItemToDelete(liveClass);
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

          {/* Offline Batches */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <List className="h-5 w-5 mr-2 text-primary" />
                Offline Batches
              </h2>
              {isAuthorised && (
                <Link
                  href={`/admin/course/create-offline-batch?courseId=${course?._id}`}
                >
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Offline Batch
                  </Button>
                </Link>
              )}
            </div>
            {isOfflineBatchLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : offlineBatchError ? (
              <div className="text-center py-8 text-red-500">
                Error loading offline batches
              </div>
            ) : offlineBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No offline batches found for this course
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Created At</TableHead>
                      {isAuthorised && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offlineBatches.map((batch: any) => (
                      <TableRow key={batch._id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/course/offline-batch?id=${batch.slug}&courseId=${course?._id}`}
                          >
                            {batch.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {moment(batch.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                        {isAuthorised && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/course/create-offline-batch?id=${batch.slug}&courseId=${course?._id}`}
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
                                  setDeleteType("offlineBatch");
                                  setItemToDelete(batch);
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

          {/* Course Reviews */}
          <div className="card mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-primary" />
              Course Reviews
            </h2>

            {isReviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reviews?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews found for this course
              </div>
            ) : (
              <div className="space-y-6">
                {reviews?.data?.map((review: any) => (
                  <div
                    key={review._id}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {review.studentId.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {review.studentId.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {moment(review.createdAt).format("MMM DD, YYYY")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* offline batch section */}
        </div>

        {/* Sidebar */}
        <div className="col-span-full lg:col-span-4">
          {/* Course Info Card */}
          <div className="card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary-50 p-2 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{course.duration}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-50 p-2 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">৳{course.price}</p>
                </div>
              </div>

              {course.offerPrice > 0 && (
                <div className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-3">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Offer Price</p>
                    <p className="font-medium">৳{course.offerPrice}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <div className="bg-primary-50 p-2 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expire Time</p>
                  <p className="font-medium">{course.expireTime}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-50 p-2 rounded-full mr-3">
                  {course.status === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{course.status}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary-50 p-2 rounded-full mr-3">
                  {course.preOrder === "on" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pre-order</p>
                  <p className="font-medium capitalize">{course.preOrder}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-medium mb-2">Created By</h3>
              <p className="text-gray-600">
                {course.createdBy?.name || "Unknown"}
              </p>
            </div>
            <br />
            {/* link to course details */}
            <Link href={`/admin/course/course-details/${course?._id}`}>
              <Button>Go to Course Details</Button>
            </Link>
          </div>
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
    </div>
  );
};

const CourseDetails = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CourseDetailsContent />
    </Suspense>
  );
};

export default CourseDetails;
