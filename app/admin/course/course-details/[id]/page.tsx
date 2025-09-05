"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useGetCourseDetails } from "@/utils/apis/getCourseDetails";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as MdIcons from "react-icons/md";

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
    {children}
  </span>
);

const Card = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

const CourseDetailsContent = () => {
  const { id } = useParams();
  const { data: courseDetails, isLoading } = useGetCourseDetails(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courseDetails?.data?.courseId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <p className="text-gray-500">Course Details not found</p>
          <br />
          <Link href={`/admin/course/create-course-details?courseId=${id}`}>
            <Button>Create Course Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  const course = courseDetails?.data?.courseId;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Course Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          {course?.cover_photo && (
            <img
              src={course.cover_photo}
              alt={course?.course_title || "Course Cover"}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{course?.course_title}</h1>
          <div className="flex flex-wrap gap-2">
            {course?.course_type && <Badge>{course.course_type}</Badge>}
            {course?.duration && <Badge>{course.duration}</Badge>}
            {course?.price && <Badge>৳{course.price}</Badge>}
          </div>
          {course?.description && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          )}
          <br />
          <Link
            href={`/admin/course/create-course-details?courseId=${id}&courseDetailsId=${courseDetails?.data?._id}`}
          >
            <Button>Update Course Details</Button>
          </Link>
        </div>
      </div>

      {/* Course Schedule */}
      {/* {(course?.daySchedule?.length > 0 || course?.timeShedule?.length > 0) && (
        <Card title="Course Schedule">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course?.daySchedule?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Days</h3>
                <div className="flex flex-wrap gap-2">
                  {course.daySchedule.map((day: string) => (
                    <Badge key={day}>{day}</Badge>
                  ))}
                </div>
              </div>
            )}
            {course?.timeShedule?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Time</h3>
                <div className="flex flex-wrap gap-2">
                  {course.timeShedule.map((time: string) => (
                    <Badge key={time}>{time}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )} */}

      {/* Prerequisites */}
      {courseDetails?.data?.isCourseExist?.length > 0 && (
        <Card title="এই কোর্সে যা থাকছে">
          <div className="flex flex-wrap gap-2">
            {courseDetails?.data?.isCourseExist.map(
              (prereq: any, idx: number) => {
                const Icon = prereq.icon && (MdIcons as any)[prereq.icon];
                return (
                  <Badge key={prereq.text + idx}>
                    {Icon && (
                      <Icon className="inline-block mr-1 align-text-bottom w-4 h-4" />
                    )}{" "}
                    {prereq.text}
                  </Badge>
                );
              }
            )}
          </div>
        </Card>
      )}

      {/* Syllabus */}
      {courseDetails?.data?.syllabus?.length > 0 && (
        <Card title="Syllabus">
          <div className="space-y-6">
            {courseDetails?.data?.syllabus.map((item: any, index: number) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold">{item?.question}</h3>
                {item?.answer?.length > 0 && (
                  <ul className="list-none space-y-1">
                    {item.answer.map((ans: string, i: number) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Course Details */}
      {courseDetails?.data?.courseDetails?.length > 0 && (
        <Card title="Course Details">
          <div className="space-y-6">
            {courseDetails?.data?.courseDetails.map(
              (item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold">{item?.question}</h3>
                  {item?.answer?.length > 0 && (
                    <ul className="list-none space-y-1">
                      {item.answer.map((ans: string, i: number) => (
                        <li key={i}>
                          <div dangerouslySetInnerHTML={{ __html: ans }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Instructors */}
      {courseDetails?.data?.instructors?.length > 0 && (
        <Card title="Instructors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courseDetails?.data?.instructors
              .filter((instructor: any) => !instructor?.isDeleted)
              .map((instructor: any) => (
                <div
                  key={instructor?._id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <h3 className="font-semibold">{instructor?.name}</h3>
                  <p className="text-sm text-gray-500">{instructor?.email}</p>
                  <p className="text-sm text-gray-500">{instructor?.phone}</p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const CourseDetailsPage = () => {
  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CourseDetailsContent />
      </Suspense>
    </div>
  );
};

export default CourseDetailsPage;
