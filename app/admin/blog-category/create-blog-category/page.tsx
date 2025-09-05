"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateBlogCategory } from "@/utils/apis/createBlogCategory";
import { useBlogCategoryList } from "@/utils/apis/getBlogCategory";
import axiosInstance from "@/utils/axios";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
});

const CreateBlogCategoryForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { mutate: createBlogCategory } = useCreateBlogCategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  // Fetch category data if editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/blog-category/${categoryId}`);
          const category = response.data.data;
          form.reset({
            title: category.title || "",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching category",
            description: error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCategory();
  }, [categoryId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Get the current user ID
      const userResponse = await axiosInstance.get("/user/profile");
      const userId = userResponse.data.data._id;

      const categoryData = {
        title: values.title,
        createdBy: userId,
      };

      if (categoryId) {
        await axiosInstance.patch(`/blog-category/${categoryId}`, categoryData);
        toast({
          title: "Category updated successfully",
          description: "The category information has been updated",
        });
      } else {
        createBlogCategory(categoryData);
      }

      router.push("/admin/blog-category/all-blog-category");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: categoryId ? "Error updating category" : "Error creating category",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Create Blog Category</h6>
            <p className="card-description">Add a new blog category</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...form.register("title")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter category title"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isFetching}
                  className="w-full px-4 py-2 text-white bg-primary-500 hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {categoryId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    categoryId ? "Update Category" : "Create Category"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateBlogCategory = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBlogCategoryForm />
    </Suspense>
  );
};

export default CreateBlogCategory;