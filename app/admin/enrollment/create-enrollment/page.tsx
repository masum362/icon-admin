"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  courseId: z.string().min(1, "Course is required"),
  batchId: z.string().optional(),
  paidAmont: z.string().min(1, "Paid amount is required"),
  due: z.string().min(0, "Due amount must be 0 or greater"),
  discount: z.string().min(0, "Discount must be 0 or greater"),
  discountReason: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentNumber: z.string().optional(),
  transctionId: z.string().optional(),
});

const paymentMethods = [
  { value: "bikash", label: "Bkash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "cash", label: "Cash" },
];

const CreateEnrollment = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [selectedCourseType, setSelectedCourseType] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      courseId: "",
      batchId: "",
      paidAmont: "",
      due: "0",
      discount: "0",
      discountReason: "",
      paymentMethod: "",
      paymentNumber: "",
      transctionId: "",
    },
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/course");
        setCourses(response.data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch courses",
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await axiosInstance.get("/offline-batch");
        setBatches(response.data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch batches",
        });
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchCourses();
    fetchBatches();
  }, []);

  // Watch for course selection changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "courseId") {
        const selectedCourse = courses.find(
          (course) => course._id === value.courseId
        );
        setSelectedCourseType(selectedCourse?.course_type || "");

        // Reset batch selection when course changes
        if (selectedCourse?.course_type !== "online") {
          form.setValue("batchId", "");
        }
      } else if (name === "paymentMethod") {
        setSelectedPaymentMethod(value.paymentMethod || "");

        // Reset payment fields when payment method changes to cash
        if (value.paymentMethod === "cash") {
          form.setValue("paymentNumber", "");
          form.setValue("transctionId", "");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, courses]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        "/enrollment/create-enrollment",
        {
          ...values,
          paidAmont: parseFloat(values.paidAmont),
          due: parseFloat(values.due),
          discount: parseFloat(values.discount),
        }
      );

      toast({
        title: "Success",
        description: "Enrollment created successfully",
      });

      router.push("/admin/enrollment/all-enrollment");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create enrollment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-4 lg:p-6">
        <h6 className="card-title">Create New Enrollment</h6>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7">
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                placeholder="Enter student name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select
                onValueChange={(value) => form.setValue("courseId", value)}
                value={form.watch("courseId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.course_title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.courseId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.courseId.message}
                </p>
              )}
            </div>

            {selectedCourseType === "online" && (
              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="batchId">Batch *</Label>
                <Select
                  onValueChange={(value) => form.setValue("batchId", value)}
                  value={form.watch("batchId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBatches ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      batches.map((batch) => (
                        <SelectItem key={batch._id} value={batch._id}>
                          {batch.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.batchId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.batchId.message}
                  </p>
                )}
              </div>
            )}

            <div className="col-span-full lg:col-span-4 space-y-2">
              <Label htmlFor="paidAmont">Paid Amount (৳) *</Label>
              <Input
                id="paidAmont"
                type="number"
                placeholder="0.00"
                {...form.register("paidAmont")}
              />
              {form.formState.errors.paidAmont && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.paidAmont.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-4 space-y-2">
              <Label htmlFor="due">Due Amount (৳)</Label>
              <Input
                id="due"
                type="number"
                placeholder="0.00"
                {...form.register("due")}
              />
              {form.formState.errors.due && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.due.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-4 space-y-2">
              <Label htmlFor="discount">Discount (৳)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="0.00"
                {...form.register("discount")}
              />
              {form.formState.errors.discount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.discount.message}
                </p>
              )}
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="discountReason">Discount Reason</Label>
              <Textarea
                id="discountReason"
                placeholder="Enter reason for discount"
                {...form.register("discountReason")}
              />
              {form.formState.errors.discountReason && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.discountReason.message}
                </p>
              )}
            </div>

            <div className="col-span-full lg:col-span-6 space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                onValueChange={(value) => form.setValue("paymentMethod", value)}
                value={form.watch("paymentMethod")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMethod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>

            {selectedPaymentMethod !== "cash" && (
              <>
                <div className="col-span-full lg:col-span-6 space-y-2">
                  <Label htmlFor="paymentNumber">Payment Number *</Label>
                  <Input
                    id="paymentNumber"
                    placeholder="Enter payment number"
                    {...form.register("paymentNumber")}
                  />
                  {form.formState.errors.paymentNumber && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.paymentNumber.message}
                    </p>
                  )}
                </div>

                <div className="col-span-full space-y-2">
                  <Label htmlFor="transctionId">Transaction ID *</Label>
                  <Input
                    id="transctionId"
                    placeholder="Enter transaction ID"
                    {...form.register("transctionId")}
                  />
                  {form.formState.errors.transctionId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.transctionId.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="col-span-full">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Enrollment"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEnrollment;
