"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, X } from "lucide-react";
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
import Link from "next/link";

// Define the form schema with Zod
const formSchema = z.object({
  question: z.string().min(5, {
    message: "Question must be at least 5 characters.",
  }),
  answer: z.array(z.string()).min(1, {
    message: "At least one answer is required.",
  }),
  duration: z.number().min(1, {
    message: "Duration must be at least 1 minute.",
  }),
  mark: z.number().min(1, {
    message: "Mark must be at least 1.",
  }),
});

const CreateFillInTheGapsForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const gapId = searchParams.get("id");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answerInput, setAnswerInput] = useState("");

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

  // Fetch Gap question data if editing
  useEffect(() => {
    const fetchGapData = async () => {
      if (gapId) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/gap-question/single/${gapId}`);
          const gapData = response.data.data;
          
          form.reset({
            question: gapData.question,
            answer: gapData.answer,
            duration: gapData.duration,
            mark: gapData.mark,
          });
        } catch (error) {
          console.error("Error fetching Gap question data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch Gap question data",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGapData();
  }, [gapId, toast]);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: [],
      duration: 1,
      mark: 1,
    },
  });

  // Add a new answer
  const addAnswer = () => {
    if (answerInput.trim() === "") return;
    
    const currentAnswers = form.getValues("answer") || [];
    if (currentAnswers.includes(answerInput.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This answer already exists",
      });
      return;
    }
    
    form.setValue("answer", [...currentAnswers, answerInput.trim()]);
    setAnswerInput("");
  };

  // Remove an answer
  const removeAnswer = (index: number) => {
    const currentAnswers = form.getValues("answer") || [];
    const newAnswers = currentAnswers.filter((_, i) => i !== index);
    form.setValue("answer", newAnswers);
  };

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

      if (gapId) {
        // Update existing Gap question
        await axiosInstance.patch(`/gap-question/update-question`, { ...payload, _id: gapId });
        toast({
          title: "Gap question updated successfully",
          description: "The gap question has been updated",
        });
      } else {
        // Create new Gap question
        await axiosInstance.post("/gap-question/create-gapquestion", payload);
        toast({
          title: "Gap question created successfully",
          description: "The gap question has been added to the exam",
        });
      }
      
      // Redirect back to the exam details page
      router.back();
    } catch (error: any) {
      console.error("Error saving gap question:", error);
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
                <Link href={`/admin/course/exam/${examId}?moduleId=${moduleId}&courseId=${courseId}`}>
                  <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {gapId ? "Edit Fill in the Gaps" : "Create Fill in the Gaps"}
                </h1>
              </div>
            </div>
          </div>

          <div className="card mt-6 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your question here... Use ____ for gaps"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answers</FormLabel>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Add an answer"
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addAnswer();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addAnswer}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value?.map((answer, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md"
                            >
                              <span>{answer}</span>
                              <button
                                type="button"
                                onClick={() => removeAnswer(index)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mark</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {gapId ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      gapId ? "Update Question" : "Create Question"
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

const CreateFillInTheGaps = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateFillInTheGapsForm />
    </Suspense>
  );
};

export default CreateFillInTheGaps;