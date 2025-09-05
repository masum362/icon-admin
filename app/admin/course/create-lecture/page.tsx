"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, Tag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  server: z.string().min(1, "Server is required"),
  videoId: z.string().min(1, "Video ID is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  isFree: z.boolean().default(false),
  status: z.enum(["Draft", "Published"]).default("Draft"),
  tags: z.array(z.string()).default([]),
  scheduleDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fetchLecture = async (lectureId: string) => {
  const response = await axiosInstance.get(
    `/lecture/single-lecture/${lectureId}`
  );
  return response.data.data;
};

const CreateLectureForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const lectureId = searchParams.get("id");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch lecture data if editing
  const { data: lectureData, isLoading: isLectureLoading } = useQuery({
    queryKey: ["lecture", lectureId],
    queryFn: () => fetchLecture(lectureId!),
    enabled: !!lectureId,
  });

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

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      server: "Youtube",
      videoId: "",
      duration: 0,
      isFree: false,
      status: "Draft",
      tags: [],
      scheduleDate: "",
    },
  });

  // Update form when lecture data is loaded
  useEffect(() => {
    if (lectureData) {
      console.log("loaded lecture data", lectureData);
      form.reset({
        title: lectureData.title,
        server: lectureData.server,
        videoId: lectureData.videoId,
        duration: lectureData.duration,
        isFree: lectureData.isFree,
        status: lectureData.status,
        tags: lectureData.tags || [],
        scheduleDate: lectureData.scheduleDate
          ? new Date(lectureData.scheduleDate).toISOString().slice(0, 16)
          : "",
      });
      setTags(lectureData.tags || []);
    }
  }, [lectureData, form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!moduleId || !courseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Module ID and Course ID are required",
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

    setIsLoading(true);
    try {
      const lectureData = {
        ...values,
        moduleId,
        courseId,
        createdBy: userId,
        tags,
      };

      if (lectureId) {
        // Update existing lecture
        await axiosInstance.patch(`/lecture/${lectureId}`, lectureData);
        toast({
          title: "Lecture updated successfully",
          description: "The lecture has been updated",
        });
      } else {
        // Create new lecture
        await axiosInstance.post("/lecture/create-lecture", lectureData);
        toast({
          title: "Lecture created successfully",
          description: "The lecture has been added to the module",
        });
      }

      router.back();
    } catch (error: any) {
      console.error("Error saving lecture:", error);
      toast({
        variant: "destructive",
        title: `Error ${lectureId ? "updating" : "creating"} lecture`,
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  if (isLectureLoading) {
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
          <Card>
            <CardHeader>
              <CardTitle>
                {lectureId ? "Edit Lecture" : "Create New Lecture"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lecture Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter lecture title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Server */}
                    <FormField
                      control={form.control}
                      name="server"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Server</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select video server" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Youtube">YouTube</SelectItem>
                              <SelectItem value="Bunny">Bunny</SelectItem>
                              <SelectItem value="Vimeo">Vimeo</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Video ID/URL */}
                    <FormField
                      control={form.control}
                      name="videoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video ID or URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter video ID or URL"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            For YouTube, enter the video ID or full URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Duration */}
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Published">
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Schedule Date */}
                    <FormField
                      control={form.control}
                      name="scheduleDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Date</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional: Schedule when this lecture will be
                            available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Is Free */}
                  <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Free Lecture
                          </FormLabel>
                          <FormDescription>
                            Make this lecture available for free
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[rgb(95_113_250)] data-[state=unchecked]:bg-[rgb(226_226_226)] [&>span]:bg-white"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Tags */}
                  <div className="space-y-2">
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddTag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {lectureId ? "Updating..." : "Creating..."}
                        </>
                      ) : lectureId ? (
                        "Update Lecture"
                      ) : (
                        "Create Lecture"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CreateLecture = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateLectureForm />
    </Suspense>
  );
};

export default CreateLecture;
