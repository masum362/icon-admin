"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useCourseCategoryList } from "@/utils/apis/getCourseCategory";
import { CourseCategory } from "@/types/courseCategory";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";

const AllCourseCategory = () => {
  const [selectedPage, setSelectedPage] = useState(1);
  const { data: courseCategoriesData, isLoading, refetch } = useCourseCategoryList(100, selectedPage);
  const categories = courseCategoriesData?.data || [];

  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/courseCategory/update-status/${id}`, {
        isDeleted: !currentStatus
      });
      
      toast({
        title: "Status updated successfully",
        description: `Category has been ${currentStatus ? 'disabled' : 'enabled'}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axiosInstance.delete(`/courseCategory/${id}`);
        
        toast({
          title: "Category deleted successfully",
          description: "The category has been removed from the system",
        });
        
        refetch();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting category",
          description: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Course Category list</h6>
            <p className="card-description">All Category Here</p>
          </div>
          <Link
            href="/admin/course-category/create-course-category"
            className="btn b-solid btn-primary-solid"
          >
            Add Category
          </Link>
        </div>
        {/* Start All Language List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
              <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                <tr>
                  <th className="px-3.5 py-4">Category Name</th>
                  <th className="px-3.5 py-4">Status</th>
                  <th className="px-3.5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {categories.map((category: CourseCategory) => (
                  <tr
                    key={category._id}
                    className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                  >
                    <td className="px-3.5 py-4">{category.title}</td>
                    <td className="px-3.5 py-4">
                      <Switch
                        checked={!category.isDeleted}
                        onCheckedChange={() => handleStatusChange(category._id, !category.isDeleted)}
                        className="data-[state=checked]:bg-[rgb(95_113_250)] data-[state=unchecked]:bg-[rgb(226_226_226)] [&>span]:bg-white"
                      />
                    </td>
                    <td className="px-3.5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/course-category/create-course-category?id=${category.slug}`}
                          className="btn-icon btn-primary-icon-light size-7"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="btn-icon btn-danger-icon-light size-7"
                          onClick={() => handleDelete(category.slug)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* End All Language List Table */}
      </div>
    </div>
  );
};

export default AllCourseCategory;
