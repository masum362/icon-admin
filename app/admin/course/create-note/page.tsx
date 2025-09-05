"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUploadPdf } from "@/utils/apis/uploadPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "@/utils/axios";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
  scheduleDate: z.string().min(1, "Schedule date is required"),
});

const CreateNoteContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: uploadPdf, isPending: isPdfUploading } = useUploadPdf();

  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("moduleId");
  const noteId = searchParams.get("id");

  // Fetch user profile and note data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await axiosInstance.get("/user/profile");
        setUserProfile(userResponse.data.data);

        // If noteId exists, fetch note data
        if (noteId) {
          setIsLoading(true);
          const noteResponse = await axiosInstance.get(
            `/note/single-note/${noteId}`
          );
          const noteData = noteResponse.data.data;

          // Pre-fill form data
          form.reset({
            title: noteData.title,
            description: noteData.description,
            status: noteData.status,
            scheduleDate: noteData.scheduleDate
              ? new Date(noteData.scheduleDate).toISOString().slice(0, 16)
              : "",
          });

          // Set PDF URL if exists
          if (noteData.noteFile) {
            setPdfUrl(noteData.noteFile);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data",
        });
      } finally {
        setIsUserLoading(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [noteId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "",
      scheduleDate: "",
    },
  });

  const handlePdfUpload = async (file: File) => {
    try {
      uploadPdf(file, {
        onSuccess: (pdfUrl: any) => {
          setPdfUrl(pdfUrl?.secure_url);
        },
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!pdfUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a PDF file",
      });
      return;
    }

    if (!userProfile?._id || !courseId || !moduleId) return;

    const noteData = {
      ...values,
      createdBy: userProfile._id,
      courseId,
      moduleId,
      noteFile: pdfUrl,
    };

    try {
      if (noteId) {
        // Update existing note
        await axiosInstance.put(`/note/${noteId}`, noteData);
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        // Create new note
        await axiosInstance.post("/note/create-note", noteData);
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      }
      router.back();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${noteId ? "update" : "create"} note`,
      });
    }
  };

  if (isUserLoading || isLoading) {
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
                <Link href="/admin/course/notes">
                  <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {noteId ? "Edit Note" : "Create Note"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter note title" {...field} />
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
                            <SelectItem value="Draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-full">
                    <FormLabel>Note File (PDF)</FormLabel>
                    {pdfUrl ? (
                      <div className="relative p-4 rounded-md border border-gray-200 dark:border-dark-border mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-6 w-6 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              PDF File Uploaded
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setPdfUrl(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="pdfFile"
                        className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer p-4 flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square mt-2"
                      >
                        <input
                          type="file"
                          id="pdfFile"
                          className="hidden"
                          accept=".pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handlePdfUpload(file);
                            }
                          }}
                          disabled={isPdfUploading}
                        />
                        <div className="flex-center flex-col">
                          {isPdfUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          ) : (
                            <>
                              <div className="size-10 lg:size-15 flex-center bg-primary-200 dark:bg-dark-icon rounded-50">
                                <svg
                                  className="h-6 w-6 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <span className="mt-2 text-gray-500 dark:text-dark-text">
                                Upload PDF File
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter note description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/course/notes")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPdfUploading}>
                    {isPdfUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : noteId ? (
                      "Update Note"
                    ) : (
                      "Create Note"
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

const CreateNote = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateNoteContent />
    </Suspense>
  );
};

export default CreateNote;
