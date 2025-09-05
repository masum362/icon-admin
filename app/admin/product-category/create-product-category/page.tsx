"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateProductCategory } from '@/utils/apis/createProductCategory';
import { useUpdateProductCategory } from '@/utils/apis/updateProductCategory';
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";

const CreateProductCategoryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const categoryId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    createdBy: "",
  });

  const { mutate: createCategory, isPending: isCreating } = useCreateProductCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateProductCategory(categoryId || "");

  // Fetch user profile to get the user ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setFormData(prev => ({
          ...prev,
          createdBy: response.data.data._id
        }));
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile",
        });
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch category data if editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/product-category/${categoryId}`);
          const category = response.data.data;
          setFormData(prev => ({
            ...prev,
            name: category.name,
            description: category.description,
          }));
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch category data",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Category name is required",
      });
      return;
    }

    if (!categoryId && !formData.createdBy) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID not found",
      });
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
    };

    if (categoryId) {
      updateCategory(submitData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Product category updated successfully",
          });
          router.push("/admin/product-category/all-product-category");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Failed to update product category",
          });
        },
      });
    } else {
      createCategory({ ...submitData, createdBy: formData.createdBy }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Product category created successfully",
          });
          router.push("/admin/product-category/all-product-category");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Failed to create product category",
          });
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-full">
          {/* Header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 flex justify-between items-center">
              <div className="flex items-center">
                <Link href="/admin/product-category/all-product-category">
                  <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {categoryId ? "Edit Product Category" : "Create Product Category"}
                </h1>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card mt-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Category Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    required
                    disabled={isFetching}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter category description"
                    rows={4}
                    disabled={isFetching}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isCreating || isUpdating || isFetching || (!categoryId && !formData.createdBy)}
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {categoryId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    categoryId ? "Update Category" : "Create Category"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateProductCategory = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CreateProductCategoryContent />
    </Suspense>
  );
};

export default CreateProductCategory;