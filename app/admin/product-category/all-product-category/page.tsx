"use client";

import React, { Suspense, useState } from "react";
import { useGetProductCategory } from "@/utils/apis/getProductCategory";
import { Loader2, Plus, Edit, Trash2, Folder } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import axiosInstance from "@/utils/axios";

const AllProductCategoryContent = () => {
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useGetProductCategory();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/product-category/${categoryToDelete.slug}`);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      refetch(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete category",
      });
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 text-lg font-medium">
            Error loading product categories
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
          {/* Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Product Categories
              </h1>
              <Link href="/admin/product-category/create-product-category">
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Table */}
          <div className="card mt-6 p-6">
            {categories?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No product categories found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.data?.map((category: any) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Folder className="h-4 w-4 mr-2 text-primary" />
                            {category.name}
                          </div>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          {moment(category.createdAt).format("MMM DD, YYYY")}
                        </TableCell>
                        <TableCell>
                          {moment(category.updatedAt).format("MMM DD, YYYY")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/product-category/create-product-category?id=${category.slug}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setCategoryToDelete({
                                  slug: category.slug,
                                  name: category.name,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "
              {categoryToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AllProductCategory = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AllProductCategoryContent />
    </Suspense>
  );
};

export default AllProductCategory;
