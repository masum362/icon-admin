"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProduct } from "@/utils/apis/createProduct";
import { useUpdateProduct } from "@/utils/apis/updateProduct";
import { useGetProductCategory } from "@/utils/apis/getProductCategory";
import { useUploadImage } from "@/utils/apis/uploadImage";
import { useUploadPdf } from "@/utils/apis/uploadPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import axiosInstance from "@/utils/axios";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    trailer: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    status: z.string().min(1, "Status is required"),
    price: z.number().min(0, "Price must be greater than 0"),
    offerPrice: z.number().optional(),
    stock: z.string().min(1, "Stock status is required"),
    tags: z.string().min(1, "At least one tag is required"),
    bookType: z.string().min(1, "Book type is required"),
    uploadLink: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate uploadLink if bookType is Ebook
      if (data.bookType === "Ebook") {
        return !!data.uploadLink;
      }
      return true;
    },
    {
      message: "Upload link is required for Ebook type",
      path: ["uploadLink"],
    }
  );

const CreateProductContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const productId = searchParams.get("id");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadLinkUrl, setUploadLinkUrl] = useState<string | null>(null);
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetProductCategory();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId || "");
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: uploadPdf, isPending: isPdfUploading } = useUploadPdf();
  const { mutate: uploadEbook, isPending: isEbookUploading } = useUploadPdf();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      trailer: "",
      categoryId: "",
      status: "",
      price: 0,
      offerPrice: undefined,
      stock: "",
      tags: "",
      bookType: "",
      uploadLink: "",
    },
  });

  // Add form state debugging
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form field changed:", { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Add form error debugging
  useEffect(() => {
    console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/product/${productId}`);
          const product = response.data.data;
          form.reset({
            title: product.title,
            description: product.description,
            trailer: product.trailer,
            categoryId: product.categoryId._id,
            status: product.status,
            price: product.price,
            offerPrice: product.offerPrice,
            stock: product.stock,
            tags: product.tags.join(", "),
            bookType: product.bookType,
            uploadLink: product.uploadLink || "",
          });
          setCoverPhotoUrl(product.coverPhoto);
          setPdfUrl(product.pdf);
          setUploadLinkUrl(product.uploadLink || "");
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchProduct();
  }, [productId]);

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          setCoverPhotoUrl(imageUrl);
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handlePdfUpload = async (file: File) => {
    try {
      uploadPdf(file, {
        onSuccess: (pdfUrl: any) => {
          console.log(pdfUrl);
          setPdfUrl(pdfUrl?.secure_url);
        },
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  };

  const handleEbookUpload = async (file: File) => {
    try {
      uploadEbook(file, {
        onSuccess: (pdfUrl: any) => {
          setUploadLinkUrl(pdfUrl?.secure_url);
          form.setValue("uploadLink", pdfUrl?.secure_url);
        },
      });
    } catch (error) {
      console.error("Error uploading ebook:", error);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation state:", form.formState);

    if (!coverPhotoUrl) {
      console.log("Validation failed: No cover photo");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a cover photo",
      });
      return;
    }

    // if (!pdfUrl) {
    //   console.log("Validation failed: No PDF file");
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: "Please upload a PDF file",
    //   });
    //   return;
    // }

    if (values.bookType === "Ebook" && !uploadLinkUrl) {
      console.log("Validation failed: No ebook file for Ebook type");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload the ebook file",
      });
      return;
    }

    if (productId) {
      console.log("Updating product with ID:", productId);
      // Update product
      const productData = {
        title: values.title,
        description: values.description,
        trailer: values.trailer || "",
        categoryId: values.categoryId,
        status: values.status,
        price: values.price,
        offerPrice: values.offerPrice ?? values.price,
        stock: values.stock,
        coverPhoto: coverPhotoUrl,
        pdf: pdfUrl != null ? pdfUrl : "",
        uploadLink: uploadLinkUrl != null ? uploadLinkUrl : "",
        tags: values.tags.split(",").map((tag) => tag.trim()),
        bookType: values.bookType,
      };

      console.log("Update product data:", productData);

      updateProduct.mutate(productData, {
        onSuccess: () => {
          console.log("Product updated successfully");
          router.push("/admin/product/all-product");
        },
        onError: (error) => {
          console.error("Error updating product:", error);
        },
      });
    } else {
      // Create product
      if (!userProfile?._id) {
        console.log("Validation failed: No user profile ID");
        return;
      }

      const productData = {
        title: values.title,
        description: values.description,
        trailer: values.trailer || "",
        categoryId: values.categoryId,
        status: values.status,
        price: values.price,
        offerPrice: values.offerPrice ?? values.price,
        stock: values.stock,
        coverPhoto: coverPhotoUrl,
        pdf: pdfUrl != null ? pdfUrl : "",
        uploadLink: uploadLinkUrl || "",
        createdBy: userProfile._id,
        tags: values.tags.split(",").map((tag) => tag.trim()),
        bookType: values.bookType,
      };

      console.log("Create product data:", productData);

      createProduct.mutate(productData, {
        onSuccess: () => {
          console.log("Product created successfully");
          router.push("/admin/product/all-product");
        },
        onError: (error) => {
          console.error("Error creating product:", error);
        },
      });
    }
  };

  if (isUserLoading || isCategoriesLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 flex justify-between items-center">
              <div className="flex items-center">
                <Link href="/admin/product/all-product">
                  <Button variant="ghost" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {productId ? "Edit Product" : "Create Product"}
                </h1>
              </div>
            </div>
          </div>

          <div className="card mt-6 p-6">
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  console.log("Form submit event triggered");
                  form.handleSubmit(handleSubmit)(e);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.data?.map((category: any) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (৳)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="offerPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Price (৳)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter offer price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stock status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="In Stock">In Stock</SelectItem>
                            <SelectItem value="Out of Stock">
                              Out of Stock
                            </SelectItem>
                            <SelectItem value="Low Stock">Low Stock</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bookType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select book type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ebook">Ebook</SelectItem>
                            <SelectItem value="Hard copy">Hard copy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("bookType") === "Ebook" && (
                    <div className="col-span-full">
                      <FormLabel>Ebook File</FormLabel>
                      {uploadLinkUrl ? (
                        <div className="relative p-4 rounded-md border border-gray-200 dark:border-dark-border mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Ebook File Uploaded
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setUploadLinkUrl(null);
                                form.setValue("uploadLink", "");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="ebookFile"
                          className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer p-4 flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square mt-2"
                        >
                          <input
                            type="file"
                            id="ebookFile"
                            className="hidden"
                            accept=".pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                await handleEbookUpload(file);
                              }
                            }}
                            disabled={isEbookUploading}
                          />
                          <div className="flex-center flex-col">
                            {isEbookUploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                              <>
                                <div className="size-10 lg:size-15 flex-center bg-primary-200 dark:bg-dark-icon rounded-50">
                                  <svg
                                    className="h-6 w-6 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <span className="mt-2 text-gray-500 dark:text-dark-text">
                                  Upload Ebook File
                                </span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="trailer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trailer URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter trailer URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tags" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-full">
                  <FormLabel>Cover Photo</FormLabel>
                  {coverPhotoUrl ? (
                    <div className="relative aspect-[4/3] rounded-md overflow-hidden mt-2">
                      <img
                        src={coverPhotoUrl}
                        alt="Product cover"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setCoverPhotoUrl(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="coverPhoto"
                      className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer aspect-[4/3] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square mt-2"
                    >
                      <input
                        type="file"
                        id="coverPhoto"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleImageUpload(file);
                          }
                        }}
                        disabled={isUploading}
                      />
                      <div className="flex-center flex-col">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <>
                            <div className="size-10 lg:size-15 flex-center bg-primary-200 dark:bg-dark-icon rounded-50">
                              <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <span className="mt-2 text-gray-500 dark:text-dark-text">
                              Choose file
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                <div className="col-span-full">
                  <FormLabel>Preview File</FormLabel>
                  {pdfUrl ? (
                    <div className="relative p-4 rounded-md border border-gray-200 dark:border-dark-border mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-6 w-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            PDF File Uploaded
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setPdfUrl(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="pdfFile"
                      className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer p-4 flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square mt-2"
                    >
                      <input
                        type="file"
                        id="pdfFile"
                        className="hidden"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handlePdfUpload(file);
                          }
                        }}
                        disabled={isPdfUploading}
                      />
                      <div className="flex-center flex-col">
                        {isPdfUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <>
                            <div className="size-10 lg:size-15 flex-center bg-primary-200 dark:bg-dark-icon rounded-50">
                              <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <span className="mt-2 text-gray-500 dark:text-dark-text">
                              Upload PDF File
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/product/all-product")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      console.log("Submit button clicked");
                      console.log("Form values:", form.getValues());
                      console.log("Form errors:", form.formState.errors);
                    }}
                    disabled={
                      createProduct.isPending ||
                      updateProduct.isPending ||
                      isUploading ||
                      isPdfUploading ||
                      isEbookUploading
                    }
                  >
                    {createProduct.isPending || updateProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {productId ? "Updating..." : "Creating..."}
                      </>
                    ) : productId ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateProduct = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateProductContent />
    </Suspense>
  );
};

export default CreateProduct;
