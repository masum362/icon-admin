"use client";

import React from "react";
import Image from "next/image";
import { useBlogDetails } from "@/utils/apis/getBlogDetails";
import moment from "moment";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const BlogDetails = (props: any) => {
  const { data: response, isLoading } = useBlogDetails(props.params.id);
  const blog = response?.data;

  console.log(blog);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Blog not found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The blog you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Blog Details</h6>
            <p className="card-description">View blog information</p>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Cover Photo */}
            {blog.coverPhoto && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={blog.coverPhoto}
                  alt={blog.title}
                  width={1200}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Blog Title and Meta Information */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      blog.status === "Published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Created:</span>
                  <span>{moment(blog.createdAt).format("MMMM D, YYYY")}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Updated:</span>
                  <span>{moment(blog.updatedAt).format("MMMM D, YYYY")}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <div
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Blog Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Category ID:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {blog.categoryId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Created By:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {blog.createdBy}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Slug:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {blog.slug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  System Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      ID:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {blog._id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Version:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {blog.__v}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        blog.isDeleted
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {blog.isDeleted ? "Deleted" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
