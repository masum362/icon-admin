'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExamStudents, ExamStudent } from '@/utils/apis/getExamStudents';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const ExamStudentsContent = () => {
  const searchParams = useSearchParams();
  const examId = searchParams.get('id') as string;
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  const { data: students, isLoading, error } = useExamStudents(examId);

  if (error) {
    return <div>Error loading students</div>;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Exam Students</h6>
            <p className="card-description">All Students in this Exam</p>
          </div>
        </div>
        {/* Start Exam Students List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
                <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                  <tr>
                    <th className="px-4 py-4">Student</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Phone</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Joined At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {students?.data?.length > 0 ? (
                    students.data.map((student: ExamStudent) => (
                      <tr
                        key={student._id}
                        className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="size-12 rounded-50 overflow-hidden dk-theme-card-square">
                              <img
                                src={student.profile_picture || "/assets/images/student/student-1.png"}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <Link href={`/admin/course/exam-answers?id=${examId}&moduleId=${moduleId}&courseId=${courseId}&studentId=${student._id}`}>
                              <h6 className="leading-none text-heading font-semibold">
                                {student.name}
                              </h6>
                              </Link>
                              <p className="font-spline_sans text-sm font-light mt-1">
                                {student.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{student.email}</td>
                        <td className="px-4 py-4">{student.phone}</td>
                        <td className="px-4 py-4">{student.status}</td>
                        <td className="px-4 py-4">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* End Exam Students List Table */}
      </div>
    </div>
  );
};

const ExamStudents = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ExamStudentsContent />
    </Suspense>
  );
};

export default ExamStudents;