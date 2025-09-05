"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInstructorList } from "@/utils/apis/getInstructor";
import { deleteInstructor } from "@/utils/apis/deleteInstructor";
import { toast } from "@/hooks/use-toast";

const AllInstructor = () => {
  const { data: instructors, isLoading, refetch } = useInstructorList(10, 1);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this instructor?")) {
      try {
        await deleteInstructor(id);
        toast({
          title: "Instructor deleted successfully",
          description: "The instructor has been removed from the system",
        });
        refetch(); // Refresh the list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting instructor",
          description: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Instructor list</h6>
            <p className="card-description">All Instructor Here</p>
          </div>
          <Link
            href="/admin/instructor/create-instructor"
            className="btn b-solid btn-primary-solid"
          >
            Add Instructor
          </Link>
        </div>
        {/* Start All Instructor List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
              <thead>
                <tr className="text-primary-500">
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Name
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Email
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Phone
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Experience
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square w-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {instructors?.data?.map((instructor: any) => (
                  <tr key={instructor._id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3.5">
                        <Link
                          href="#"
                          className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                        >
                          <img
                            src={instructor.profile_picture || "/assets/images/student/student-2.png"}
                            alt={instructor.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <h6 className="leading-none text-heading font-semibold">
                            <Link href="#">{instructor.name}</Link>
                          </h6>
                          <p className="font-spline_sans text-sm font-light mt-1">
                            {instructor.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{instructor.email}</td>
                    <td className="px-4 py-4">{instructor.phone}</td>
                    <td className="px-4 py-4">{instructor.address}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/instructor/create-instructor?id=${instructor._id}`}
                          className="btn-icon btn-primary-icon-light size-7"
                        >
                          <i className="ri-edit-2-line text-inherit text-[13px]"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(instructor._id)}
                          className="btn-icon btn-danger-icon-light size-7"
                        >
                          <i className="ri-delete-bin-line text-inherit text-[13px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* End All Instructor List Table */}
      </div>
    </div>
  );
};

export default AllInstructor;
