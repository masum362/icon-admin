"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetExamDetails } from "@/utils/apis/getExamDetails";
import {
  useGetMCQQuestionList,
  MCQQuestion,
} from "@/utils/apis/getMCQQuestionList";
import {
  useGetCQQuestionList,
  CQQuestion,
} from "@/utils/apis/getCQQuestionList";
import {
  useGetFillInTheGapsQuestionList,
  FillInTheGapsQuestion,
} from "@/utils/apis/getFillInTheGapsQuestionList";
import { Loader2, Plus, Edit, Trash2, ClipboardList } from "lucide-react";
import Link from "next/link";
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
import moment from "moment";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const ExamDetailsContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const examTitle = searchParams.get("examTitle");
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const examType = searchParams.get("examType");

  //   const { data: examDetails, isLoading: isExamDetailsLoading, error: examDetailsError } = useGetExamDetails(examId);
  const {
    data: mcqQuestions,
    isLoading: isMCQLoading,
    error: mcqError,
    refetch: refetchMCQ,
  } = useGetMCQQuestionList(examId);
  const {
    data: cqQuestions,
    isLoading: isCQLoading,
    error: cqError,
    refetch: refetchCQ,
  } = useGetCQQuestionList(examId);
  const {
    data: fillInTheGapsQuestions,
    isLoading: isFillInTheGapsLoading,
    error: fillInTheGapsError,
    refetch: refetchFillInTheGaps,
  } = useGetFillInTheGapsQuestionList(examId);

  const mcqs = mcqQuestions?.data || [];
  const cqs = cqQuestions?.data || [];
  const fillInTheGaps = fillInTheGapsQuestions?.data || [];

  const isLoading = isMCQLoading || isCQLoading || isFillInTheGapsLoading;
  const hasError = mcqError || cqError || fillInTheGapsError;

  const [mcqToDelete, setMcqToDelete] = useState<string | null>(null);
  const [cqToDelete, setCqToDelete] = useState<string | null>(null);
  const [gapToDelete, setGapToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMCQ = async () => {
    if (!mcqToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/mcq/${mcqToDelete}`);
      toast({
        title: "MCQ deleted successfully",
        description: "The MCQ has been removed.",
      });
      setMcqToDelete(null);
      refetchMCQ();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting MCQ",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCQ = async () => {
    if (!cqToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/cq-question/delete-cqquestion`, {
        data: { _id: cqToDelete },
      });
      toast({
        title: "CQ deleted successfully",
        description: "The creative question has been removed.",
      });
      setCqToDelete(null);
      refetchCQ();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting CQ",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteGap = async () => {
    if (!gapToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/gap-question/delete-gapquestion`, {
        data: { _id: gapToDelete },
      });
      toast({
        title: "Fill in the gap question deleted successfully",
        description: "The question has been removed.",
      });
      setGapToDelete(null);
      refetchFillInTheGaps();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting question",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 text-lg font-medium">
            Error loading exam details
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
          {/* Exam Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                {examTitle}
              </h1>
              <Link
                href={`/admin/course/exam-students?id=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
              >
                <Button size="sm" className="flex items-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Students
                </Button>
              </Link>
            </div>
          </div>

          {/* Exam Details */}
          {/* <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                Exam Information
              </h2>
              <Link href={`/admin/course/create-exam?id=${examId}&moduleId=${moduleId}&courseId=${courseId}`}>
                <Button size="sm" className="flex items-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Exam
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{examDetails?.description || 'No description available'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{examDetails?.duration || 0} minutes</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="font-medium">{examDetails?.totalMarks || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium">
                  {examDetails?.startTime 
                    ? moment(examDetails.startTime).format('MMM DD, YYYY hh:mm A') 
                    : 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">End Time</p>
                <p className="font-medium">
                  {examDetails?.endTime 
                    ? moment(examDetails.endTime).format('MMM DD, YYYY hh:mm A') 
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div> */}

          {/* MCQ Questions */}
          {(examType === "MCQ" || examType === "Mixed") && (
            <div className="card mt-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  Multiple Choice Questions
                </h2>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/course/create-mcq?examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                  >
                    <Button
                      size="sm"
                      className="flex items-center print:hidden"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add MCQ
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex items-center print:hidden"
                    onClick={() => {
                      // Generate minimal HTML for MCQ questions
                      const mcqHtml = `
                        <html>
                        <head>
                          <title>MCQ Questions</title>
                          <style>
                            body { font-family: sans-serif; margin: 40px; }
                            ol { counter-reset: mcq; }
                            li { margin-bottom: 24px; break-inside: avoid; }
                            .options { margin-left: 24px; }
                            .question-image { 
                              max-width: 300px; 
                              height: auto; 
                              max-height: 200px;
                              margin: 10px 0; 
                              border: 1px solid #ddd; 
                              border-radius: 4px; 
                            }
                            .question-content { margin-bottom: 10px; }
                          </style>
                        </head>
                        <body>
                          <center><h1>Icon Admission Aid</h1></center>
                          <center><h3>MCQ Questions</h3></center>
                          <ol>
                            ${mcqs
                              .map(
                                (mcq: any, idx: number) => `
                              <li>
                                <div class="question-content">${
                                  mcq.question
                                }</div>
                                ${
                                  mcq.questionImg
                                    ? `<img src="${mcq.questionImg}" alt="Question Image" class="question-image" />`
                                    : ""
                                }
                                <div class="options">
                                  ${mcq.options
                                    .map(
                                      (option: any, oidx: number) =>
                                        `(${String.fromCharCode(
                                          65 + oidx
                                        )}) ${option}`
                                    )
                                    .join("<br/>")}
                                </div>
                              </li>
                            `
                              )
                              .join("")}
                          </ol>
                          <script>window.onload = function() { window.print(); };</script>
                        </body>
                        </html>
                      `;
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.open();
                        printWindow.document.write(mcqHtml);
                        printWindow.document.close();
                      }
                    }}
                  >
                    Download Question
                  </Button>
                </div>
              </div>

              {mcqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No MCQ questions found for this exam
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="print:hidden">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Options</TableHead>
                        <TableHead>Correct Answer</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mcqs.map((mcq: MCQQuestion, index: number) => (
                        <TableRow key={mcq._id}>
                          <TableCell className="font-medium">
                            <Link href={`/admin/course/question/${mcq._id}`}>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: mcq.question,
                                }}
                              />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {mcq.options.map(
                                (option: string, optionIndex: number) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center"
                                  >
                                    <span className="font-medium mr-2">
                                      {String.fromCharCode(65 + optionIndex)}.
                                    </span>
                                    <span>{option}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{mcq.correctAnswer}</TableCell>
                          <TableCell>{mcq.marks}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/course/create-mcq?id=${mcq._id}&examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setMcqToDelete(mcq._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete MCQ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this MCQ?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setMcqToDelete(null)}
                                      disabled={isDeleting}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteMCQ}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* CQ Questions */}
          {(examType === "CQ" || examType === "Mixed") && (
            <div className="card mt-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  Creative Questions
                </h2>
                <Link
                  href={`/admin/course/create-cq?examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                >
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add CQ
                  </Button>
                </Link>
              </div>

              {cqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No creative questions found for this exam
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cqs.map((cq: CQQuestion, index: number) => (
                        <TableRow key={cq._id}>
                          <TableCell className="font-medium">
                            <Link href={`/admin/course/question/${cq._id}`}>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: cq.question,
                                }}
                              />
                            </Link>
                          </TableCell>
                          <TableCell>{cq.marks}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/course/create-cq?id=${cq._id}&examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setCqToDelete(cq._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Creative Question?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      creative question? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setCqToDelete(null)}
                                      disabled={isDeleting}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteCQ}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Fill in the Gaps Questions */}
          {(examType === "Fill in the gaps" || examType === "Mixed") && (
            <div className="card mt-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  Fill in the Gaps Questions
                </h2>
                <Link
                  href={`/admin/course/create-fill-in-the-gaps?examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                >
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Fill in the Gaps
                  </Button>
                </Link>
              </div>

              {fillInTheGaps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No fill in the gaps questions found for this exam
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fillInTheGaps.map(
                        (question: FillInTheGapsQuestion, index: number) => (
                          <TableRow key={question._id}>
                            <TableCell className="font-medium">
                              <Link
                                href={`/admin/course/question/${question._id}`}
                              >
                                {question.question}
                              </Link>
                            </TableCell>
                            <TableCell>{question.answer}</TableCell>
                            <TableCell>{question.marks}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/admin/course/create-fill-in-the-gaps?id=${question._id}&examId=${examId}&moduleId=${moduleId}&courseId=${courseId}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() =>
                                        setGapToDelete(question._id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Fill in the Gap Question?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        question? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel
                                        onClick={() => setGapToDelete(null)}
                                        disabled={isDeleting}
                                      >
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteGap}
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExamDetails = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ExamDetailsContent />
    </Suspense>
  );
};

export default ExamDetails;
