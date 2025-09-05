"use client";

import React, { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetMCQAttemptList } from "@/utils/apis/getMCQAttemptList";
import { useGetCQAttemptList } from "@/utils/apis/getCQAttemptList";
import { useGetGapAttemptList } from "@/utils/apis/getGapAttemptList";
import { Loader2, FileText, Download, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import moment from "moment";

// Define the marking form schema
const markingFormSchema = z.object({
  score: z.number().min(0).max(100, {
    message: "Score must be between 0 and 100",
  }),
  comment: z.string().min(1, {
    message: "Comment is required",
  }),
});

const ExamAnswersContent = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const studentName = searchParams.get("studentName");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const {
    data: mcqAttempts,
    isLoading: isMCQLoading,
    error: mcqError,
  } = useGetMCQAttemptList(studentId || "");
  const [mcqAttemptByExam, setMcqAttemptByExam] = useState<any | null>(null);
  const [isMCQByExamLoading, setIsMCQByExamLoading] = useState(false);
  const [mcqByExamError, setMcqByExamError] = useState<any>(null);
  const {
    data: cqAttempts,
    isLoading: isCQLoading,
    error: cqError,
  } = useGetCQAttemptList(studentId || "");
  const [cqMarkingsByExam, setCqMarkingsByExam] = useState<any[] | null>(null);
  const [isCQMarkingsLoading, setIsCQMarkingsLoading] = useState(false);
  const [cqMarkingsError, setCqMarkingsError] = useState<any>(null);
  const {
    data: gapAttempts,
    isLoading: isGapLoading,
    error: gapError,
  } = useGetGapAttemptList(studentId || "");

  // When mcqAttempts loads, derive examId from it and fetch the specific attempt by student+exam
  React.useEffect(() => {
    const fetchAttemptByExam = async () => {
      if (!studentId) return;
      const examIdFromMcq = mcqAttempts?.data?.[0]?.examId;
      if (!examIdFromMcq) return;
      setIsMCQByExamLoading(true);
      try {
        const res = await axiosInstance.get(
          `/mcq-attemp?studentId=${studentId}&examId=${examIdFromMcq}`
        );
        if (
          res.data &&
          Array.isArray(res.data.data) &&
          res.data.data.length > 0
        ) {
          setMcqAttemptByExam(res.data.data[0]);
        } else {
          setMcqAttemptByExam(null);
        }
      } catch (err: any) {
        setMcqByExamError(err);
      } finally {
        setIsMCQByExamLoading(false);
      }
    };

    fetchAttemptByExam();
  }, [mcqAttempts, studentId]);

  // When cqAttempts loads, derive examId from it and fetch cq markings for that student+exam
  React.useEffect(() => {
    const fetchCQMarkingsByExam = async () => {
      if (!studentId) return;
      const examIdFromCq =
        cqAttempts?.data?.[0]?.examId?._id || cqAttempts?.data?.[0]?.examId;
      if (!examIdFromCq) return;
      setIsCQMarkingsLoading(true);
      try {
        const res = await axiosInstance.get(
          `/cq-marking?examId=${examIdFromCq}&studentId=${studentId}`
        );
        if (res.data && Array.isArray(res.data.data)) {
          setCqMarkingsByExam(res.data.data);
        } else {
          setCqMarkingsByExam([]);
        }
      } catch (err: any) {
        setCqMarkingsError(err);
      } finally {
        setIsCQMarkingsLoading(false);
      }
    };

    fetchCQMarkingsByExam();
  }, [cqAttempts, studentId]);

  // Initialize marking form
  const markingForm = useForm<z.infer<typeof markingFormSchema>>({
    resolver: zodResolver(markingFormSchema),
    defaultValues: {
      score: 0,
      comment: "",
    },
  });

  // Handle marking submission
  const handleMarkingSubmit = async (
    values: z.infer<typeof markingFormSchema>
  ) => {
    if (!selectedAttempt) return;

    try {
      setIsSubmitting(true);
      const payload = {
        studentId: studentId,
        examId: selectedAttempt.examId._id,
        questionId: selectedAttempt.questionId._id,
        score: values.score,
        comment: values.comment,
      };
      await axiosInstance.post("/cq-marking/create-cqmarking", payload);
      toast({
        title: "Marking submitted successfully",
        description: "The CQ has been marked",
      });
      // Reset form and close dialog
      markingForm.reset();
      setSelectedAttempt(null); // This will close the dialog
    } catch (error: any) {
      console.error("Error submitting marking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMCQLoading || isCQLoading || isGapLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mcqError || cqError || gapError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 text-lg font-medium">
            Error loading exam answers
          </p>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-full">
          {/* Student Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Exam Answers
              </h1>
            </div>
          </div>

          {/* MCQ Attempts */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Multiple Choice Questions
              </h2>
            </div>
            {/** Prefer mcqAttemptByExam (student+exam) if available, otherwise fallback to mcqAttempts hook */}
            {isMCQByExamLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading MCQ attempt...
              </div>
            ) : mcqAttemptByExam ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Submitted Time</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mcqAttemptByExam.answer?.map(
                      (attempt: any, idx: number) => (
                        <TableRow key={attempt.questionId?._id || idx}>
                          <TableCell className="font-medium">
                            {attempt?.questionId?.question}
                          </TableCell>
                          <TableCell>{attempt?.selectedAnswer}</TableCell>
                          <TableCell>
                            {moment(
                              mcqAttemptByExam.createdAt ||
                                attempt.submittedTime
                            ).format("MMM DD, YYYY hh:mm A")}
                          </TableCell>
                          {/* <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(
                                  mcqAttemptByExam.submitedPdf ||
                                    attempt.submitedPdf,
                                  "_blank"
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
                {/* show simple summary */}
                <div className="mt-3 text-sm text-gray-700">
                  Correct: {mcqAttemptByExam.correctCount ?? 0} • Wrong:{" "}
                  {mcqAttemptByExam.wrongCount ?? 0}
                </div>
              </div>
            ) : mcqAttempts?.data?.[0]?.answer?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Submitted Time</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mcqAttempts?.data[0]?.answer?.map(
                      (attempt: any, idx: number) => (
                        <TableRow key={attempt._id || idx}>
                          <TableCell className="font-medium">
                            {attempt?.questionId?.question}
                          </TableCell>
                          <TableCell>{attempt?.selectedAnswer}</TableCell>
                          <TableCell>
                            {moment(
                              attempt.submittedTime ||
                                mcqAttempts.data[0]?.createdAt
                            ).format("MMM DD, YYYY hh:mm A")}
                          </TableCell>
                          {/* <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(attempt.submitedPdf, "_blank")
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No MCQ attempts found
              </div>
            )}
          </div>

          {/* CQ Attempts */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Creative Questions
              </h2>
            </div>

            {cqAttempts?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No creative question attempts found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Submitted Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cqAttempts?.data?.map((attempt: any) => {
                      const markingForAttempt = cqMarkingsByExam?.find(
                        (m: any) =>
                          m.questionId?._id === attempt.questionId?._id ||
                          m.questionId === attempt.questionId?._id ||
                          m.questionId === attempt._id
                      );

                      return (
                        <TableRow key={attempt._id}>
                          <TableCell className="font-medium">
                            {attempt.examId.examTitle}
                          </TableCell>
                          <TableCell>
                            <div
                              className="text-sm text-gray-500"
                              dangerouslySetInnerHTML={{
                                __html: attempt?.questionId?.question || "",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {moment(attempt.submittedTime).format(
                              "MMM DD, YYYY hh:mm A"
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <div className="flex items-center justify-end space-x-2">
                              {markingForAttempt ? (
                                <div className="text-sm text-green-700">
                                  Marked: {markingForAttempt.score ?? "-"}
                                </div>
                              ) : null}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  window.open(attempt.submitedPdf, "_blank")
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Dialog
                                open={selectedAttempt?._id === attempt._id}
                                onOpenChange={(open) => {
                                  if (!open) setSelectedAttempt(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setSelectedAttempt(attempt)}
                                  >
                                    <CheckSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Mark CQ Attempt</DialogTitle>
                                  </DialogHeader>
                                  <Form {...markingForm}>
                                    <form
                                      onSubmit={markingForm.handleSubmit(
                                        handleMarkingSubmit
                                      )}
                                      className="space-y-4"
                                    >
                                      <FormField
                                        control={markingForm.control}
                                        name="score"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Score (0-100)</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                {...field}
                                                onChange={(e) =>
                                                  field.onChange(
                                                    Number(e.target.value)
                                                  )
                                                }
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={markingForm.control}
                                        name="comment"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Comment</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Enter your comments here..."
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
                                          onClick={() => {
                                            markingForm.reset();
                                            setSelectedAttempt(null);
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="submit"
                                          disabled={isSubmitting}
                                        >
                                          {isSubmitting ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Submitting...
                                            </>
                                          ) : (
                                            "Submit Marking"
                                          )}
                                        </Button>
                                      </div>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Fill in the Gaps Attempts */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Fill in the Gaps
              </h2>
            </div>

            {gapAttempts?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fill in the gaps attempts found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Attempted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gapAttempts?.data?.map((attempt: any) => (
                      <TableRow key={attempt._id}>
                        <TableCell className="font-medium">
                          {attempt.examId.examTitle}
                        </TableCell>
                        <TableCell>{attempt.questionId.question}</TableCell>
                        <TableCell>{attempt.score}</TableCell>
                        <TableCell>{attempt.totalMarks}</TableCell>
                        <TableCell>
                          {moment(attempt.attemptedAt).format(
                            "MMM DD, YYYY hh:mm A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamAnswers = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ExamAnswersContent />
    </Suspense>
  );
};

export default ExamAnswers;
