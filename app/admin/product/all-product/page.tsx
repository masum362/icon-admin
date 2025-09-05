"use client";

import React, { Suspense } from "react";
import { useGetProduct } from '@/utils/apis/getProduct';
import { Loader2, Plus, Edit, Trash2, Tag, DollarSign, Package, Play } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import moment from "moment";
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
import axiosInstance from "@/utils/axios";
import { useRouter } from "next/navigation";

const AllProductListContent = () => {
  const { data: products, isLoading, error, refetch } = useGetProduct();
  const { toast } = useToast();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/product/${productToDelete}`);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      refetch(); // Refresh the product list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
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
          <p className="text-red-500 text-lg font-medium">Error loading products</p>
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
              <h1 className="text-2xl md:text-3xl font-bold text-black">Products</h1>
              <Link href="/admin/product/create-product">
                <Button size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Add AlertDialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Products Table */}
          <div className="card mt-6 p-6">
            {products?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Book Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.data?.map((product: any) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden">
                              <img
                                src={product.coverPhoto}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-primary" />
                            {product.categoryId.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                          ৳
                            <div>
                              <div className="text-sm text-gray-500 line-through">{product.price}</div>
                              {product.offerPrice && (
                                <div className="font-medium">
                                  {product.offerPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-primary" />
                            {product.stock}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.bookType}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {product.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{product.createdBy.name}</div>
                            <div className="text-gray-500">{product.createdBy.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {moment(product.createdAt).format('MMM DD, YYYY')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/product/create-product?id=${product.slug}`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setProductToDelete(product.slug);
                                setDeleteDialogOpen(true);
                              }}
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
    </div>
  );
};

const AllProductList = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AllProductListContent />
    </Suspense>
  );
};

export default AllProductList;