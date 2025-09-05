"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Loader2,
} from "lucide-react";
import ImageUpload from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadImage } from "@/utils/apis/uploadImage";
import axiosInstance from "@/utils/axios";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  thumbnail: z.any().optional(),
});

const CreateCourseCategoryForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

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
          const response = await axiosInstance.get(`/coursecategory/${categoryId}`);
          const category = response.data.data;

          // Set form values
          form.reset({
            title: category.title || "",
          });

          // Set cover photo URL
          if (category.cover_photo) {
            setCoverPhotoUrl(category.cover_photo);
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching category",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCategory();
  }, [categoryId, form]);

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          setCoverPhotoUrl(imageUrl);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error uploading image",
            description: "Failed to upload the image. Please try again.",
          });
        }
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: "Failed to upload the image. Please try again.",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Get the current user ID (you might need to adjust this based on your auth setup)
      const userResponse = await axiosInstance.get("/user/profile");
      const userId = userResponse.data.data._id;

      // Prepare data for API
      const categoryData = {
        title: values.title,
        cover_photo: coverPhotoUrl || "",
        createdBy: userId,
      };

      // Create or update category
      if (categoryId) {
        await axiosInstance.patch(`/coursecategory/${categoryId}`, categoryData);
        toast({
          title: "Category updated successfully",
          description: "The category information has been updated",
        });
      } else {
        await axiosInstance.post("/coursecategory", categoryData);
        toast({
          title: "Category created successfully",
          description: "A new category has been added to the system",
        });
      }

      // Redirect to category list
      router.push("/admin/course-category/all-course-category");
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-full lg:col-span-7 card p-4 lg:p-6">
            <div className="p-1.5">
              <h6 className="card-title">
                {categoryId ? "Edit Category" : "Add New Category"}
              </h6>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 mt-7 pt-0.5">
                <div className="col-span-full xl:col-auto space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Category Title"
                    {...form.register("title")}
                    disabled={isFetching}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-full lg:col-span-5 card p-4 lg:p-6">
            <div className="p-1.5">
              <h6 className="card-title">Add media files</h6>
              <div className="mt-7 pt-0.5">
                <p className="text-xs text-gray-500 dark:text-dark-text-two leading-none font-semibold mb-3">
                  Thumbnail (548x234)
                </p>
                {coverPhotoUrl ? (
                  <div className="relative aspect-[4/1.5] rounded-md overflow-hidden mb-4">
                    <img
                      src={coverPhotoUrl}
                      alt="Category thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setCoverPhotoUrl(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="thumbnail"
                    className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer aspect-[4/1.5] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square"
                  >
                    <input
                      type="file"
                      id="thumbnail"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("thumbnail", file);
                          await handleImageUpload(file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <div className="flex-center flex-col">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : (
                        <>
                          <div className="size-10 lg:size-15 flex-center bg-primary-200 dark:bg-dark-icon rounded-50">
                            <ImageUpload
                              src="/assets/images/icons/upload-file.svg"
                              alt="icon"
                              className="dark:brightness-200 dark:contrast-100 w-1/2 lg:w-auto"
                              height={25}
                              width={25}
                            />
                          </div>
                          <span className="mt-2 text-gray-500 dark:text-dark-text">
                            Choose file
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
              <Button 
                type="submit" 
                className="mt-4" 
                disabled={isLoading || isFetching || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {categoryId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  categoryId ? "Update Category" : "Create Category"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateCourseCategory = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CreateCourseCategoryForm />
    </Suspense>
  );
};

export default CreateCourseCategory;
