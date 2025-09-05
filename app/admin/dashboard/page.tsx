"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { useStudentList } from "@/utils/apis/getStudent";
import { useCourseList } from "@/utils/apis/getCourseList";
import { useInstructorList } from "@/utils/apis/getInstructor";
import { useIncomeReport } from "@/utils/apis/getIncomeReport";

// Mock data for the dashboard
const studentEnrollmentData = [
  { name: "Jan", students: 0 },
  { name: "Feb", students: 0 },
  { name: "Mar", students: 0 },
  { name: "Apr", students: 0 },
  { name: "May", students: 0 },
  { name: "Jun", students: 0 },
  { name: "Jul", students: 0 },
  { name: "Aug", students: 0 },
  { name: "Sep", students: 0 },
  { name: "Oct", students: 0 },
  { name: "Nov", students: 0 },
  { name: "Dec", students: 0 },
];

const courseCategoryData: any = [
  // { name: "Web Development", value: 0 },
  // { name: "Mobile Development", value: 0 },
  // { name: "Data Science", value: 0 },
  // { name: "UI/UX Design", value: 0 },
  // { name: "Digital Marketing", value: 0 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const recentActivities = [
  {},
  // {
  //   id: 1,
  //   user: "John Doe",
  //   action: "enrolled in",
  //   target: "Advanced JavaScript Course",
  //   time: "2 hours ago",
  //   avatar: "/assets/images/user/user-1.png",
  // },
  // {
  //   id: 2,
  //   user: "Jane Smith",
  //   action: "completed",
  //   target: "UI/UX Fundamentals",
  //   time: "5 hours ago",
  //   avatar: "/assets/images/user/user-2.png",
  // },
  // {
  //   id: 3,
  //   user: "Robert Johnson",
  //   action: "submitted assignment for",
  //   target: "React.js Mastery",
  //   time: "1 day ago",
  //   avatar: "/assets/images/user/user-3.png",
  // },
  // {
  //   id: 4,
  //   user: "Emily Davis",
  //   action: "started",
  //   target: "Python for Beginners",
  //   time: "2 days ago",
  //   avatar: "/assets/images/user/user-4.png",
  // },
  // {
  //   id: 5,
  //   user: "Michael Wilson",
  //   action: "earned certificate in",
  //   target: "Digital Marketing Essentials",
  //   time: "3 days ago",
  //   avatar: "/assets/images/user/user-5.png",
  // },
];

const Dashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const { data: studentData } = useStudentList(1000000, 1);
  const { data: courseData } = useCourseList(1000000, 1);
  const { data: instructorData } = useInstructorList(1000000, 1);
  const { data: incomeReportData } = useIncomeReport();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserProfile(response?.data?.data);
        const role = response?.data?.data?.role;
        if (role === "teacher") {
          router.replace("/admin/course/all-course");
          return;
        } else if (role === "shopManager") {
          router.replace("/admin/shop-manager/all-shop-manager");
          return;
        } else if (role === "admin" || role === "superAdmin") {
          setRoleChecked(true);
        } else {
          setRoleChecked(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile",
        });
        setRoleChecked(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [router]);

  if (isLoading || !roleChecked) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Students
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {studentData?.data?.length || 0}
              </h3>
              <p className="text-xs text-green-500 mt-1">+0% from last month</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Courses
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {courseData?.data?.length || 0}
              </h3>
              <p className="text-xs text-green-500 mt-1">+0% from last month</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Instructors
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {instructorData?.data?.length || 0}
              </h3>
              <p className="text-xs text-green-500 mt-1">+0% from last month</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                ৳{incomeReportData?.totalIncome || 0}
              </h3>
              <p className="text-xs text-green-500 mt-1">+0% from last month</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Enrollment Chart */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Student Enrollment
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={studentEnrollmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                />
                <Legend />
                <Bar dataKey="students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Categories Chart */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Course Categories
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    name,
                    percent,
                  }: {
                    name: string;
                    percent: number;
                  }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {courseCategoryData.map((entry: any, index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recent Activities
            </h3>
            <Link
              href="/admin/activities"
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-icon transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={activity.avatar}
                      alt={activity.user}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-white">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/course/create-course"
              className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-dark-icon hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Create New Course
              </span>
            </Link>

            <Link
              href="/admin/student/create-student"
              className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-dark-icon hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Add New Student
              </span>
            </Link>

            <Link
              href="/admin/instructor/create-instructor"
              className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-dark-icon hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Add New Instructor
              </span>
            </Link>

            <Link
              href="/admin/course-category/create-course-category"
              className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-dark-icon hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Create Course Category
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
