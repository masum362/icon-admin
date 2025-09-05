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
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateBlog } from "@/utils/apis/createBlog";
import { useBlogCategoryList } from "@/utils/apis/getBlogCategory";
import axiosInstance from "@/utils/axios";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useUploadImage } from "@/utils/apis/uploadImage";
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
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  tags: z.array(z.string()),
  coverPhoto: z.string().optional(),
});

const statusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];

const CreateBlogForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { mutate: createBlog } = useCreateBlog();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { data: categoryData, isLoading: isCategoryLoading } =
    useBlogCategoryList(100, 1);
  const categories = categoryData?.data || [];
  const [imageUrl, setImageUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      status: "Draft",
      tags: [],
      coverPhoto: "",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your blog description here...",
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

  // Fetch blog data if editing
  useEffect(() => {
    const fetchBlog = async () => {
      if (blogId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/blog/${blogId}`);
          const blog = response.data.data;

          form.reset({
            title: blog.title || "",
            description: blog.description || "",
            categoryId: blog.categoryId?._id || "",
            status: blog.status || "Draft",
            tags: blog.tags || [],
            coverPhoto: blog.coverPhoto || "",
          });

          if (blog.coverPhoto) {
            setCoverPhotoUrl(blog.coverPhoto);
          }
          if (blog.tags) {
            setBlogTags(blog.tags);
          }
          if (blog.description && editor) {
            editor.commands.setContent(blog.description);
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching blog",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchBlog();
  }, [blogId, form, editor]);

  // Add effect to update form description when editor content changes
  useEffect(() => {
    if (editor) {
      const updateFormDescription = () => {
        const content = editor.getHTML();
        form.setValue("description", content);
      };

      editor.on("update", updateFormDescription);
      return () => {
        editor.off("update", updateFormDescription);
      };
    }
  }, [editor, form]);

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          if (imageUrl) {
            setCoverPhotoUrl(imageUrl);
            form.setValue("coverPhoto", imageUrl);
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

  const handleAddTag = () => {
    if (tagInput.trim() && !blogTags.includes(tagInput.trim())) {
      const updatedTags = [...blogTags, tagInput.trim()];
      setBlogTags(updatedTags);
      form.setValue("tags", updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = blogTags.filter((t) => t !== tag);
    setBlogTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Get the current user ID
      const userResponse = await axiosInstance.get("/user/profile");
      const userId = userResponse.data.data._id;

      const blogData = {
        ...values,
        description: editor?.getHTML() || "",
        createdBy: userId,
        coverPhoto: coverPhotoUrl || "",
      };

      if (blogId) {
        await axiosInstance.patch(`/blog/${blogId}`, blogData);
        toast({
          title: "Blog updated successfully",
          description: "The blog information has been updated",
        });
      } else {
        createBlog(blogData);
      }

      router.push("/admin/blog/all-blog");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: blogId ? "Error updating blog" : "Error creating blog",
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
        <div className="card p-4 lg:p-6">
          <h6 className="card-title">
            {blogId ? "Edit Blog" : "Add New Blog"}
          </h6>
          <div className="grid grid-cols-12 gap-x-4 gap-y-5 mt-7 pt-0.5">
            <div className="col-span-full space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Blog Title"
                {...form.register("title")}
                disabled={isFetching}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="col-span-full space-y-2">
              <Label>Description *</Label>
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
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-gray-200" : ""}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
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
                  <Dialog
                    open={isImageDialogOpen}
                    onOpenChange={setIsImageDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={
                          editor.isActive("image") ? "bg-gray-200" : ""
                        }
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                          />
                        </div>
                        <Button onClick={addImage}>Insert Image</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                disabled={isFetching || isCategoryLoading}
                onValueChange={(value) => form.setValue("categoryId", value)}
                defaultValue={form.getValues("categoryId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(
                    (category: { _id: string; title: string }) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                disabled={isFetching}
                onValueChange={(value) => form.setValue("status", value)}
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="col-span-full space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {blogTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            <div className="col-span-full space-y-2">
              <Label>Cover Photo</Label>
              {coverPhotoUrl ? (
                <div className="relative aspect-[4/1.5] rounded-md overflow-hidden mb-4">
                  <img
                    src={coverPhotoUrl}
                    alt="Blog cover"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCoverPhotoUrl(null);
                      form.setValue("coverPhoto", "");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="coverPhoto"
                  className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer aspect-[4/1.5] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square"
                >
                  <input
                    type="file"
                    id="coverPhoto"
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
                          <img
                            src="/assets/images/icons/upload-file.svg"
                            alt="icon"
                            className="dark:brightness-200 dark:contrast-100 w-1/2 lg:w-auto"
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

            <div className="col-span-full">
              <Button
                type="submit"
                disabled={isLoading || isFetching || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {blogId ? "Updating..." : "Creating..."}
                  </>
                ) : blogId ? (
                  "Update Blog"
                ) : (
                  "Create Blog"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateBlog = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBlogForm />
    </Suspense>
  );
};

export default CreateBlog;
