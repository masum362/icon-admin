"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCourseList } from "@/utils/apis/getCourseList";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { Course } from "@/types/course";

const AllCourse = () => {
  const [limit, setLimit] = useState(100);
  const [selectedPage, setSelectedPage] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data, isFetching, refetch } = useCourseList(limit, selectedPage);

  useEffect(() => {
    const fetchUserProfileAndCourses = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserProfile(response?.data?.data);
        if (response?.data?.data?.role === "teacher") {
          const teacherId = response?.data?.data?._id;
          const courseRes = await axiosInstance.get(
            `/course-details?instructors=${teacherId}`
          );
          setTeacherCourses(courseRes?.data?.data || []);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile or courses",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfileAndCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await axiosInstance.delete(`/course/${id}`);
        toast({
          title: "Course deleted successfully",
          description: "The course has been removed from the system",
        });
        refetch(); // Refresh the list using React Query's refetch
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting course",
          description: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Course list</h6>
            <p className="card-description">All Course Here</p>
          </div>
          {userProfile?.role !== "teacher" && (
            <Link
              href="/admin/course/create-course"
              className="btn b-solid btn-primary-solid"
            >
              Add Course
            </Link>
          )}
        </div>
        {/* Start All Course List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            {isLoading || isFetching ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
                <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                  <tr>
                    <th className="px-3.5 py-4">Course title</th>
                    <th className="px-3.5 py-4">Price</th>
                    <th className="px-3.5 py-4">Validity</th>
                    <th className="px-3.5 py-4 w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {userProfile?.role === "teacher"
                    ? (teacherCourses.length > 0 ? (
                        teacherCourses.map((item: any) => {
                          const course = item.courseId;
                          return (
                            <tr
                              key={item._id}
                              className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                            >
                              <td className="flex items-center gap-2 px-3.5 py-4">
                                <Link
                                  href={`/admin/course/${course.slug}`}
                                  className="size-[70px] rounded-50 overflow-hidden dk-theme-card-square"
                                >
                                  <img
                                    src={
                                      course.cover_photo ||
                                      "/assets/images/admin/top-course/top-course-1.png"
                                    }
                                    alt={course.course_title}
                                    width={70}
                                    height={70}
                                    className="w-full h-full object-cover"
                                  />
                                </Link>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                                    {new Date(course.createdAt).toLocaleDateString()}
                                  </p>
                                  <h6 className="text-lg leading-none text-heading font-semibold line-clamp-1">
                                    <Link href={`/admin/course/${course.slug}`}>
                                      {course.course_title}
                                    </Link>
                                  </h6>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <i className="ri-star-fill !text-[10px] !text-[#FFA305]"></i>
                                      <span className="text-xs font-semibold leading-none">
                                        4.5
                                      </span>
                                    </div>
                                    <p className="font-normal text-xs text-gray-900">
                                      Category - {course.category?.title || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3.5 py-4">
                                {course.price > 0 ? (
                                  <span className="font-semibold">
                                    ৳{course.price}
                                  </span>
                                ) : (
                                  "Free"
                                )}
                              </td>
                              <td className="px-3.5 py-4">{course.expireTime}</td>
                              <td className="px-3.5 py-4">
                                {/* No edit/delete for teacher */}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center">
                            No courses found
                          </td>
                        </tr>
                      ))
                    : (data?.data?.length > 0 ? (
                        data.data.map((course: Course) => (
                          <tr
                            key={course._id}
                            className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                          >
                            <td className="flex items-center gap-2 px-3.5 py-4">
                              <Link
                                href={`/admin/course/${course.slug}`}
                                className="size-[70px] rounded-50 overflow-hidden dk-theme-card-square"
                              >
                                <img
                                  src={
                                    course.cover_photo ||
                                    "/assets/images/admin/top-course/top-course-1.png"
                                  }
                                  alt={course.course_title}
                                  width={70}
                                  height={70}
                                  className="w-full h-full object-cover"
                                />
                              </Link>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-dark-text-two mb-1.5">
                                  {new Date(course.createdAt).toLocaleDateString()}
                                </p>
                                <h6 className="text-lg leading-none text-heading font-semibold line-clamp-1">
                                  <Link href={`/admin/course/${course.slug}`}>
                                    {course.course_title}
                                  </Link>
                                </h6>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <i className="ri-star-fill !text-[10px] !text-[#FFA305]"></i>
                                    <span className="text-xs font-semibold leading-none">
                                      4.5
                                    </span>
                                  </div>
                                  <p className="font-normal text-xs text-gray-900">
                                    Category - {course.category?.title || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-4">
                              {course.price > 0 ? (
                                <span className="font-semibold">
                                  ৳{course.price}
                                </span>
                              ) : (
                                "Free"
                              )}
                            </td>
                            <td className="px-3.5 py-4">{course.expireTime}</td>
                            <td className="px-3.5 py-4">
                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/admin/course/create-course?id=${course.slug}`}
                                  className="btn-icon btn-primary-icon-light size-7"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="btn-icon btn-danger-icon-light size-7"
                                  onClick={() => handleDelete(course.slug)}
                                >
                                  <Trash2 className="h-4 w-4 text-danger" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center">
                            No courses found
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* End All Course List Table */}
      </div>
    </div>
  );
};

export default AllCourse;
