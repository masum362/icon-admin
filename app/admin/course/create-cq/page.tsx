"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// Module-scoped rich editor to avoid remounts and preserve focus
const RichEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write question..." }),
      LinkExtension.configure({ openOnClick: false }),
      Image,
    ],
    content: value || "",
    editorProps: { attributes: { class: "prose prose-sm min-h-[120px] p-2" } },
  });

  // sync parent -> editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // notify parent on updates
  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange(editor.getHTML());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onChange]);

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  if (!editor) return null;

  return (
    <div>
      <div className="border-b p-2 flex gap-2 flex-wrap bg-gray-50">
        <button
          type="button"
          className={
            editor.isActive("bold") ? "bg-gray-200 p-1 rounded" : "p-1"
          }
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={
            editor.isActive("italic") ? "bg-gray-200 p-1 rounded" : "p-1"
          }
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={
            editor.isActive("bulletList") ? "bg-gray-200 p-1 rounded" : "p-1"
          }
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          className={
            editor.isActive("orderedList") ? "bg-gray-200 p-1 rounded" : "p-1"
          }
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => setIsImageDialogOpen(true)}
          className={
            editor.isActive("image") ? "bg-gray-200 p-1 rounded" : "p-1"
          }
        >
          Img
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1"
        >
          Redo
        </button>
      </div>

      {/* simple image dialog fallback using prompt */}
      {isImageDialogOpen && (
        <div className="p-4 bg-white border">
          <div className="grid gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL"
              className="border p-2"
            />
            <div className="flex gap-2">
              <button type="button" onClick={addImage} className="btn">
                Insert
              </button>
              <button
                type="button"
                onClick={() => setIsImageDialogOpen(false)}
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Define the form schema with Zod
const formSchema = z.object({
  question: z.string().min(5, {
    message: "Question must be at least 5 characters.",
  }),
  status: z.string().min(1, {
    message: "Status is required.",
  }),
  durationDate: z.string().min(1, {
    message: "Duration date is required.",
  }),
});

const CreateCQForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const cqId = searchParams.get("id");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Fetch the current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserId(response.data.data._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user information",
        });
      }
    };

    fetchUser();
  }, [toast]);

  // Fetch CQ data if editing
  useEffect(() => {
    const fetchCQData = async () => {
      if (cqId) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/cq-question/${cqId}`);
          console.log("CQ API Response:", response.data); // Debug log

          // Check if data exists in the response
          if (!response.data) {
            throw new Error("No data received from the API");
          }

          const cqData = response.data.data || response.data; // Try both possible structures
          console.log("CQ Data:", cqData); // Debug log

          if (!cqData) {
            throw new Error("Invalid data structure received");
          }

          // Format the date for the datetime-local input
          const formattedDate = cqData.durationDate
            ? new Date(cqData.durationDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16);

          const formData = {
            question: cqData.question || "",
            status: cqData.status || "Drafted",
            durationDate: formattedDate,
          };

          console.log("Form Data:", formData); // Debug log
          setInitialData(formData);
        } catch (error: any) {
          console.error("Error fetching CQ data:", error);
          console.error("Error details:", error.response?.data); // Debug log
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch CQ data",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setInitialData({
          question: "",
          status: "Drafted",
          durationDate: new Date().toISOString().slice(0, 16),
        });
      }
    };

    fetchCQData();
  }, [cqId, toast]);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      question: "",
      status: "",
      durationDate: "",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!examId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Exam ID is required",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is required",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        examId,
        createdBy: userId,
      };

      if (cqId) {
        // Update existing CQ
        await axiosInstance.patch(`/cq-question/update-cqquestion`, {
          ...payload,
          _id: cqId,
        });
        toast({
          title: "CQ updated successfully",
          description: "The CQ has been updated",
        });
      } else {
        // Create new CQ
        await axiosInstance.post("/cq-question/create-cqquestion", payload);
        toast({
          title: "CQ created successfully",
          description: "The CQ has been added to the exam",
        });
      }

      // Redirect back to the exam details page
      router.back();
    } catch (error: any) {
      console.error("Error saving CQ:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 flex justify-between items-center">
              <div className="flex items-center">
                <Link
                  href={`/admin/course/exam/${examId}?moduleId=${moduleId}&courseId=${courseId}`}
                >
                  <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {cqId ? "Edit Creative Question" : "Create Creative Question"}
                </h1>
              </div>
            </div>
          </div>

          <div className="card mt-6 p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <RichEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Drafted">Drafted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {cqId ? "Updating..." : "Creating..."}
                      </>
                    ) : cqId ? (
                      "Update CQ"
                    ) : (
                      "Create CQ"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCQ = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCQForm />
    </Suspense>
  );
};

export default CreateCQ;
