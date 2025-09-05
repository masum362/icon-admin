"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import axiosInstance from "@/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OfflineBatchContent = () => {
  const searchParams = useSearchParams();
  const batchSlug = searchParams.get("id");
  const [batch, setBatch] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatch = async () => {
      if (!batchSlug) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get(`/offline-batch/${batchSlug}`);
        setBatch(data.data);
      } catch (err: any) {
        setError("Failed to fetch batch details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatch();
  }, [batchSlug]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!batch?._id) return;
      setIsStudentLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/batch-student?batchId=${batch._id}`
        );
        setStudents(data.data || []);
      } catch (err) {
        setStudents([]);
      } finally {
        setIsStudentLoading(false);
      }
    };
    if (batch?._id) fetchStudents();
  }, [batch?._id]);

  // Search students by name
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const { data } = await axiosInstance.get(
        `/student?search=${encodeURIComponent(searchTerm)}`
      );
      setSearchResults(data.data || []);
    } catch (err) {
      setSearchError("Failed to search students");
    } finally {
      setIsSearching(false);
    }
  };

  // Add student to batch
  const handleAddStudent = async (studentId: string) => {
    if (!batch?._id || !batch.courseId?._id) return;
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      await axiosInstance.post("/batch-student/create-batch-student", {
        batchId: batch._id,
        courseId: batch.courseId._id,
        studentId,
      });
      setAddSuccess("Student added successfully");
      setSearchResults([]);
      setSearchTerm("");
      setIsAddStudentOpen(false);
      // Refetch students
      const { data } = await axiosInstance.get(
        `/batch-student?batchId=${batch._id}`
      );
      setStudents(data.data || []);
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to add student");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          {/* Header Card */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Offline Batch Details
              </h1>
            </div>
          </div>

          {/* Batch Info Card */}
          <div className="card mt-6">
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : batch ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    Batch Name: {batch.name}
                  </h2>
                </div>
              ) : null}
            </CardContent>
          </div>

          {/* Students Card */}
          <div className="card mt-6">
            <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
              <div>
                <h6 className="card-title">Batch Students</h6>
                <p className="card-description">All Students in this Batch</p>
              </div>
              <Button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Student
              </Button>
            </div>

            <div className="p-3 sm:p-4">
              {isStudentLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No students found for this batch.
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Joined At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student: any) => (
                        <TableRow key={student._id}>
                          <TableCell>
                            {student.studentId?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {student.studentId?.phone || "-"}
                          </TableCell>
                          <TableCell>
                            {student.courseId?.course_title || "-"}
                          </TableCell>
                          <TableCell>
                            {student.courseId?.duration || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(student.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Add Student Modal */}
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Student to Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSearching}
                />
                <Button
                  type="submit"
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>
              {searchError && (
                <div className="text-red-500 mb-2">{searchError}</div>
              )}
              {addError && <div className="text-red-500 mb-2">{addError}</div>}
              {addSuccess && (
                <div className="text-green-600 mb-2">{addSuccess}</div>
              )}
              <div className="max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((student: any) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAddStudent(student?.userId?._id)
                              }
                              disabled={addLoading}
                            >
                              {addLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Add"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  searchTerm &&
                  !isSearching && (
                    <div className="text-gray-500">No students found.</div>
                  )
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const OfflineBatch = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OfflineBatchContent />
    </Suspense>
  );
};

export default OfflineBatch;
