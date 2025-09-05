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
  examTitle: z.string().min(1, "Exam title is required"),
  examType: z.enum(["MCQ", "CQ", "Fill in the gaps"]).default("MCQ"),
  totalQuestion: z.coerce.number().min(1, "Total questions must be at least 1"),
  positiveMark: z.coerce.number().min(0, "Positive mark must be 0 or greater"),
  negativeMark: z.coerce.number().min(0, "Negative mark must be 0 or greater"),
  mcqDuration: z.coerce
    .number()
    .min(1, "MCQ duration must be at least 1 minute"),
  cqMark: z.coerce.number().min(0, "CQ mark must be 0 or greater"),
  cqDuration: z.coerce
    .number()
    .min(0, "CQ exam duration must be 0 or greater")
    .optional(),
  validTime: z.string().nullable().optional(),
  status: z.enum(["drafted", "published"]).default("drafted"),
  scheduleDate: z.string().nullable().optional(),
});

// Require cqDuration only when examType is CQ
const formSchemaWithConditional = formSchema.superRefine((data, ctx) => {
  if (data.examType === "CQ") {
    if (data.cqDuration === undefined || data.cqDuration === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cqDuration"],
        message: "CQ duration is required for CQ exams",
      });
    } else if (typeof data.cqDuration === "number" && data.cqDuration < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cqDuration"],
        message: "CQ exam duration must be 0 or greater",
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

const fetchExam = async (examId: string) => {
  const response = await axiosInstance.get(`/exam/single-exam/${examId}`);
  return response.data.data;
};

// validTime is now a single datetime-local string managed below

const CreateExamForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const examId = searchParams.get("id");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exam data if editing
  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => fetchExam(examId!),
    enabled: !!examId,
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
      examTitle: "",
      examType: "MCQ",
      totalQuestion: 0,
      positiveMark: 1,
      negativeMark: 0.25,
      mcqDuration: 60,
      cqMark: 20,
      cqDuration: 10,
      validTime: "",
      status: "drafted",
      scheduleDate: "",
    },
  });

  // Update form when exam data is loaded
  useEffect(() => {
    if (examData) {
      form.reset({
        examTitle: examData.examTitle,
        examType: examData.examType,
        totalQuestion: examData.totalQuestion,
        positiveMark: examData.positiveMark,
        negativeMark: examData.negativeMark,
        mcqDuration: examData.mcqDuration,
        cqMark: examData.cqMark,
        cqDuration: examData.cqDuration,
        validTime: examData.validTime || "",
        status: examData.status,
        scheduleDate: examData.scheduleDate
          ? new Date(examData.scheduleDate).toISOString().slice(0, 16)
          : null,
      });
    }
  }, [examData, form]);

  // Watch the exam type to conditionally show fields
  const examType = form.watch("examType");

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
      const examData = {
        ...values,
        moduleId,
        courseId,
        createdBy: userId,
      };

      if (examId) {
        // Update existing exam
        await axiosInstance.patch(`/exam/${examId}`, examData);
        toast({
          title: "Exam updated successfully",
          description: "The exam has been updated",
        });
      } else {
        // Create new exam
        await axiosInstance.post("/exam/create-exam", examData);
        toast({
          title: "Exam created successfully",
          description: "The exam has been added to the module",
        });
      }

      router.back();
    } catch (error: any) {
      console.error("Error saving exam:", error);
      toast({
        variant: "destructive",
        title: `Error ${examId ? "updating" : "creating"} exam`,
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isExamLoading) {
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
              <CardTitle>{examId ? "Edit Exam" : "Create New Exam"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Exam Title */}
                    <FormField
                      control={form.control}
                      name="examTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter exam title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Exam Type */}
                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exam type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MCQ">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="CQ">
                                Creative Questions
                              </SelectItem>
                              <SelectItem value="Fill in the gaps">
                                Fill in the gaps
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Questions */}
                    <FormField
                      control={form.control}
                      name="totalQuestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Questions</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* MCQ Specific Fields */}
                    {examType === "MCQ" && (
                      <>
                        {/* Positive Mark */}
                        <FormField
                          control={form.control}
                          name="positiveMark"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Positive Mark</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Negative Mark */}
                        <FormField
                          control={form.control}
                          name="negativeMark"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Negative Mark</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* MCQ Duration */}
                        <FormField
                          control={form.control}
                          name="mcqDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MCQ Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* CQ Specific Field */}
                    {examType === "CQ" && (
                      <FormField
                        control={form.control}
                        name="cqMark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CQ Mark</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {examType === "CQ" && (
                      <FormField
                        control={form.control}
                        name="cqDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Duration (Min)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Valid Time (single datetime for all exam types) */}
                    <FormField
                      control={form.control}
                      name="validTime"
                      render={({ field }) => (
                        <FormItem className="col-span-full">
                          <FormLabel>Valid Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value || null)
                              }
                            />
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
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="drafted">Draft</SelectItem>
                              <SelectItem value="published">
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
                            <Input
                              type="datetime-local"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value || null);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Schedule when this exam will be available
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                          {examId ? "Updating..." : "Creating..."}
                        </>
                      ) : examId ? (
                        "Update Exam"
                      ) : (
                        "Create Exam"
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

const CreateExam = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateExamForm />
    </Suspense>
  );
};

export default CreateExam;
