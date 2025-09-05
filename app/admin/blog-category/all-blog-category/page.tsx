"use client";

import React from "react";
import Link from "next/link";
import { useBlogCategoryList } from "@/utils/apis/getBlogCategory";
import { deleteBlogCategory } from "@/utils/apis/deleteBlogCategory";
import { toast } from "@/hooks/use-toast";

const BlogCategoryList = () => {
  const { data: blogCategories, isLoading, refetch } = useBlogCategoryList(10, 1);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog category?")) {
      try {
        await deleteBlogCategory(id);
        toast({
          title: "Blog category deleted successfully",
          description: "The blog category has been removed from the system",
        });
        refetch(); // Refresh the list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting blog category",
          description: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Blog Category list</h6>
            <p className="card-description">All Blog Categories Here</p>
          </div>
          <Link
            href="/admin/blog-category/create-blog-category"
            className="btn b-solid btn-primary-solid"
          >
            Add Blog Category
          </Link>
        </div>
        {/* Start All Blog Category List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
              <thead>
                <tr className="text-primary-500">
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Title
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Slug
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Created At
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Status
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square w-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {blogCategories?.data?.map((category: any) => (
                  <tr key={category._id}>
                    <td className="px-4 py-4">
                      <div>
                        <h6 className="leading-none text-heading font-semibold">
                          {category.title}
                        </h6>
                      </div>
                    </td>
                    <td className="px-4 py-4">{category.slug}</td>
                    <td className="px-4 py-4">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.isDeleted 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {category.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/blog-category/create-blog-category?id=${category.slug}`}
                          className="btn-icon btn-primary-icon-light size-7"
                        >
                          <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(category.slug)}
                          className="btn-icon btn-danger-icon-light size-7"
                        >
                          <i className="ri-delete-bin-line text-inherit text-[13px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* End All Blog Category List Table */}
      </div>
    </div>
  );
};

export default BlogCategoryList;