"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { toast } from "@/hooks/use-toast";
import { useUploadImage } from "@/utils/apis/uploadImage";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.any().optional(),
});

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Main component with useSearchParams
const CreateShopManagerForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your meta description here...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-2",
      },
    },
  });

  // Fetch manager data if editing
  useEffect(() => {
    const fetchManager = async () => {
      if (managerId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/user/${managerId}`);
          const manager = response.data.data;

          // Set form values
          form.reset({
            name: manager.name || "",
            phone: manager.phone || "",
            email: manager.email || "",
            address: manager.address || "",
          });

          // Set profile image URL if available
          if (manager.profile_picture) {
            setProfileImageUrl(manager.profile_picture);
          }

          // Set editor content if available
          if (manager.metaDescription && editor) {
            editor.commands.setContent(manager.metaDescription);
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching shop manager",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchManager();
  }, [managerId, form, editor]);

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          if (imageUrl) {
            setProfileImageUrl(imageUrl);
            form.setValue("profileImage", imageUrl);
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error uploading image",
            description: "Failed to upload the image. Please try again.",
          });
        },
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
      // Prepare data for API
      const managerData = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        metaDescription: editor?.getHTML() || "",
        profile_picture: profileImageUrl || "",
        role: "shopManager",
      };

      // Create or update manager
      if (managerId) {
        await axiosInstance.patch(`/user/${managerId}`, managerData);
        toast({
          title: "Shop manager updated successfully",
          description: "The shop manager information has been updated",
        });
      } else {
        await axiosInstance.post("/user/create-manager", managerData);
        toast({
          title: "Shop manager created successfully",
          description: "A new shop manager has been added to the system",
        });
      }

      // Redirect to manager list
      router.push("/admin/shop-manager/all-shop-manager");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: managerId
          ? "Error updating shop manager"
          : "Error creating shop manager",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-full lg:col-span-7 card p-4 lg:p-6">
            <h6 className="card-title">
              {managerId ? "Edit Shop Manager" : "Add New Shop Manager"}
            </h6>
            <div className="grid grid-cols-12 gap-x-4 gap-y-5 mt-7 pt-0.5">
              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  {...form.register("name")}
                  disabled={isFetching}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone Number"
                  {...form.register("phone")}
                  disabled={isFetching}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  {...form.register("email")}
                  disabled={isFetching}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="col-span-full space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Your Address"
                  {...form.register("address")}
                  disabled={isFetching}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="col-span-full space-y-2">
                <Label>Meta Description</Label>
                <div className="border rounded-md overflow-hidden">
                  <div className="border-b p-2 flex gap-2 flex-wrap bg-gray-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={editor.isActive("bold") ? "bg-gray-200" : ""}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={editor.isActive("italic") ? "bg-gray-200" : ""}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      className={editor.isActive("strike") ? "bg-gray-200" : ""}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={
                        editor.isActive("bulletList") ? "bg-gray-200" : ""
                      }
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={
                        editor.isActive("orderedList") ? "bg-gray-200" : ""
                      }
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                      className={
                        editor.isActive("blockquote") ? "bg-gray-200" : ""
                      }
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-full lg:col-span-5 card p-4 lg:p-6">
            <h6 className="card-title">Add media files</h6>
            <div className="mt-7 pt-0.5">
              <p className="text-xs text-gray-500 dark:text-dark-text-two leading-none font-semibold mb-3">
                Profile (200x200)
              </p>
              {profileImageUrl ? (
                <div className="relative size-[200px] rounded-md overflow-hidden mb-4">
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setProfileImageUrl(null);
                      form.setValue("profileImage", "");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="profileImage"
                  className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer size-[200px] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square"
                >
                  <input
                    type="file"
                    id="profileImage"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
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
                          <svg
                            className="w-5 h-5 text-primary-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
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
              className="mt-4 w-full"
              disabled={isLoading || isFetching}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {managerId ? "Updating..." : "Creating..."}
                </>
              ) : managerId ? (
                "Update Shop Manager"
              ) : (
                "Create Shop Manager"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Main component with Suspense boundary
const CreateShopManager = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateShopManagerForm />
    </Suspense>
  );
};

export default CreateShopManager;
