"use client";

import React from "react";
import Link from "next/link";
import { useBlogList } from "@/utils/apis/getBlog";
import { deleteBlog } from "@/utils/apis/deleteBlog";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

const BlogList = () => {
  const { data: blogs, isLoading, refetch } = useBlogList(10, 1);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id);
        toast({
          title: "Blog deleted successfully",
          description: "The blog has been removed from the system",
        });
        refetch(); // Refresh the list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting blog",
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
            <h6 className="card-title">Blog list</h6>
            <p className="card-description">All Blogs Here</p>
          </div>
          <Link
            href="/admin/blog/create-blog"
            className="btn b-solid btn-primary-solid"
          >
            Add Blog
          </Link>
        </div>
        {/* Start All Blog List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
              <thead>
                <tr className="text-primary-500">
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Cover Photo
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Title
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Category
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Author
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Tags
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Status
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Created At
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square w-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {blogs?.data?.map((blog: any) => (
                  <tr key={blog._id}>
                    <td className="px-4 py-4">
                      <div className="relative w-16 h-16">
                        <img
                          src={blog.coverPhoto}
                          alt={blog.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <Link href={`/admin/blog/blog-details/${blog.slug}`}>
                          <h6 className="leading-none text-heading font-semibold">
                            {blog.title}
                          </h6>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {blog.description?.slice(0, 100)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{blog.categoryId?.title}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{blog.createdBy?.name}</p>
                        <p className="text-sm text-gray-500">
                          {blog.createdBy?.role}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {blog?.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-dark-card-two rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          blog.isDeleted
                            ? "bg-red-100 text-red-800"
                            : blog.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.isDeleted ? "Deleted" : blog.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/blog/create-blog?id=${blog.slug}`}
                          className="btn-icon btn-primary-icon-light size-7"
                        >
                          <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.slug)}
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
        {/* End All Blog List Table */}
      </div>
    </div>
  );
};

export default BlogList;
