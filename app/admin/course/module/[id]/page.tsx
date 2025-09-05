"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useLectureList, Lecture } from "@/utils/apis/getLectureList";
import { useExamList, Exam } from "@/utils/apis/getExamList";
import { useNoteList, Note } from "@/utils/apis/getNoteList";
import {
  Loader2,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ClipboardList,
  FileText,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import moment from "moment";

const ModuleDetailsContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = params.id as string;
  const moduleName = searchParams.get("moduleName");
  const courseId = searchParams.get("courseId");

  const {
    data: lectureData,
    isLoading: isLectureLoading,
    error: lectureError,
    refetch: refetchLectures,
  } = useLectureList(moduleId);
  const {
    data: examData,
    isLoading: isExamLoading,
    error: examError,
    refetch: refetchExams,
  } = useExamList(moduleId);
  const {
    data: noteData,
    isLoading: isNoteLoading,
    error: noteError,
    refetch: refetchNotes,
  } = useNoteList(moduleId);

  const lectures = lectureData?.data || [];
  const exams = examData?.data || [];
  const notes = noteData?.data || [];

  console.log("moduleName", moduleName);

  const handleDeleteLecture = async (slug: string) => {
    try {
      await axiosInstance.delete(`/lecture/${slug}`);
      toast({
        title: "Lecture deleted successfully",
        description: "The lecture has been removed from the module",
      });
      refetchLectures(); // Refresh the lecture list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting lecture",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await axiosInstance.delete(`/exam/${examId}`);
      toast({
        title: "Exam deleted successfully",
        description: "The exam has been removed from the module",
      });
      refetchExams(); // Refresh the exam list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting exam",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleDeleteNote = async (slug: string) => {
    try {
      await axiosInstance.delete(`/note/${slug}`);
      toast({
        title: "Note deleted successfully",
        description: "The note has been removed from the module",
      });
      refetchNotes(); // Refresh the note list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting note",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  if (isLectureLoading || isExamLoading || isNoteLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (lectureError || examError || noteError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 text-lg font-medium">
            Error loading module details
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
          {/* Module Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                {moduleName}
              </h1>
            </div>
          </div>

          {/* Lectures List */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Lectures
              </h2>
              <Link
                href={`/admin/course/create-lecture?moduleId=${moduleId}&courseId=${courseId}`}
              >
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lecture
                </Button>
              </Link>
            </div>

            {lectures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No lectures found for this module
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule Date</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lectures.map((lecture: Lecture) => (
                      <TableRow key={lecture._id}>
                        <TableCell className="font-medium">
                          {lecture.title}
                        </TableCell>
                        <TableCell>{lecture.duration} minutes</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lecture.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {lecture.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {lecture.scheduleDate
                            ? moment(lecture.scheduleDate).format(
                                "MMM DD, YYYY"
                              )
                            : "Not scheduled"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lecture.tags &&
                              lecture.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/course/create-lecture?id=${lecture.slug}&moduleId=${moduleId}&courseId=${courseId}`}
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the lecture "
                                    {lecture.title}" from the module.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteLecture(lecture.slug)
                                    }
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
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

          {/* Exams List */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                Exams
              </h2>
              <Link
                href={`/admin/course/create-exam?moduleId=${moduleId}&courseId=${courseId}`}
              >
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exam
                </Button>
              </Link>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exams found for this module
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Questions</TableHead>
                      {/* <TableHead>Duration</TableHead> */}
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam: Exam) => (
                      <TableRow key={exam._id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/course/exam/${exam._id}?moduleId=${moduleId}&courseId=${courseId}&examTitle=${exam.examTitle}&examType=${exam.examType}`}
                          >
                            {exam.examTitle}
                          </Link>
                        </TableCell>
                        <TableCell>{exam.examType}</TableCell>
                        <TableCell>{exam.totalQuestion}</TableCell>
                        {/* <TableCell>{exam.mcqDuration} minutes</TableCell> */}
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              exam.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exam.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {exam.scheduleDate
                            ? moment(exam.scheduleDate).format("MMM DD, YYYY")
                            : "Not scheduled"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/course/create-exam?id=${exam.slug}&moduleId=${moduleId}&courseId=${courseId}`}
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the exam "
                                    {exam.examTitle}" from the module.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteExam(exam.slug)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
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

          {/* Notes List */}
          <div className="card mt-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Notes
              </h2>
              <Link
                href={`/admin/course/create-note?moduleId=${moduleId}&courseId=${courseId}`}
              >
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              </Link>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notes found for this module
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.map((note: Note) => (
                      <TableRow key={note._id}>
                        <TableCell className="font-medium">
                          {note.title}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {note.description}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              note.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {note.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {note.scheduleDate
                            ? moment(note.scheduleDate).format("MMM DD, YYYY")
                            : "Not scheduled"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/course/create-note?id=${note.slug}&moduleId=${moduleId}&courseId=${courseId}`}
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the note "{note.title}"
                                    from the module.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteNote(note.slug)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
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
        </div>
      </div>
    </div>
  );
};

const ModuleDetails = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ModuleDetailsContent />
    </Suspense>
  );
};

export default ModuleDetails;
