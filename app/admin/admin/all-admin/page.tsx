"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { deleteUser } from "@/utils/apis/deleteUser";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminListPage = () => {
  const [limit, setLimit] = useState(10);
  const [selectedPage, setSelectedPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin-list", limit, selectedPage],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/admin?role=admin&limit=${limit}&page=${selectedPage}`
      );
      return {
        data: response?.data?.data || [],
        total: response?.data?.data?.length || 0,
        page: selectedPage,
        limit: limit,
      };
    },
  });

  useEffect(() => {
    if (selectedPage > maxPage) setMaxPage(selectedPage);
  }, [selectedPage, maxPage]);

  // Calculate how many page buttons to show
  const showNext = data?.data && data.data.length === limit;
  const pageNumbers = Array.from(
    { length: showNext ? maxPage + 1 : maxPage },
    (_, i) => i + 1
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      try {
        await axiosInstance.delete(`/admin/${id}`);
        toast({
          title: "Admin deleted successfully",
          description: "The admin has been removed from the system",
        });
        refetch(); // Refresh the list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error deleting admin",
          description: error.response?.data?.message || "Something went wrong",
        });
      }
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Admin list</h6>
            <p className="card-description">All Admins Here</p>
          </div>
          <Link
            href="/admin/admin/create-admin"
            className="btn b-solid btn-primary-solid"
          >
            Add Admin
          </Link>
        </div>
        {/* Start All Admin List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            {isFetching ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <table className="table-auto w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text leading-none">
                  <thead className="border-b border-gray-200 dark:border-dark-border font-semibold">
                    <tr>
                      <th className="px-4 py-4">Admin</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Phone</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((admin: any) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-primary-200/50 dark:hover:bg-dark-icon hover:text-gray-500 dark:hover:text-white"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3.5">
                              <div
                                // href={`/admin/admin/${admin._id}`}
                                className="size-12 rounded-50 overflow-hidden dk-theme-card-square"
                              >
                                <img
                                  src={
                                    admin.profile_picture ||
                                    "/assets/images/student/student-1.png"
                                  }
                                  alt={admin.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h6 className="leading-none text-heading font-semibold">
                                  <div>
                                    {admin.name}
                                  </div>
                                </h6>
                                <p className="font-spline_sans text-sm font-light mt-1">
                                  {admin.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{admin.email || "N/A"}</td>
                          <td className="px-4 py-4">{admin.phone}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-dark-card-two rounded-full text-xs">
                              {admin.role}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                admin.isDeleted
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {admin.isDeleted ? "Deleted" : admin.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/admin/create-admin?id=${admin._id}`}
                                className="btn-icon btn-primary-icon-light size-7"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="btn-icon btn-danger-icon-light size-7"
                                onClick={() => handleDelete(admin._id)}
                              >
                                <Trash2 className="h-4 w-4 text-danger" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          No admins found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Bar */}
                {data?.data && data.data.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-dark-border">
                    {/* Limit Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Show Result:
                      </span>
                      <select
                        className="border rounded-md px-2 py-1 text-sm focus:outline-none bg-white dark:bg-dark-card-two"
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setSelectedPage(1);
                        }}
                      >
                        {[10, 20, 50, 100].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setSelectedPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={selectedPage === 1}
                        className="rounded-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedPage((prev) => prev + 1)}
                        disabled={data.data.length < limit}
                        className="rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* End All Admin List Table */}
      </div>
    </div>
  );
};

export default AdminListPage;
