"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

const CreateExpenseForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expenseSlug = searchParams.get("slug");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      category: "",
      paymentMethod: "",
    },
  });

  // Fetch the current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserId(response.data.data._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user information",
        });
      }
    };

    fetchUser();
  }, [toast]);

  // Fetch expense data if editing
  useEffect(() => {
    const fetchExpense = async () => {
      if (expenseSlug) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(
            `/accounts/single-expense/${expenseSlug}`
          );
          const expense = response.data.data;

          form.reset({
            title: expense.title || "",
            description: expense.description || "",
            amount: expense.amount?.toString() || "",
            category: expense.category || "",
            paymentMethod: expense.paymentMethod || "",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching expense",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchExpense();
  }, [expenseSlug, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User information not available",
      });
      return;
    }

    setIsLoading(true);
    try {
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount),
        addedBy: userId,
      };

      if (expenseSlug) {
        await axiosInstance.patch(
          `/accounts/update-expense/${expenseSlug}`,
          expenseData
        );
        toast({
          title: "Expense updated successfully",
          description: "The expense information has been updated",
        });
      } else {
        await axiosInstance.post("/accounts/create-expense", expenseData);
        toast({
          title: "Expense created successfully",
          description: "A new expense has been added to the system",
        });
      }

      router.push("/admin/accounts/all-expense");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: expenseSlug
          ? "Error updating expense"
          : "Error creating expense",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-full lg:col-span-7 card p-4 lg:p-6">
            <h6 className="card-title">
              {expenseSlug ? "Edit Expense" : "Add New Expense"}
            </h6>

            <div className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <Input
                  {...form.register("title")}
                  placeholder="Enter expense title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Description</label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Enter expense description"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Amount</label>
                <Input
                  type="number"
                  {...form.register("amount")}
                  placeholder="Enter expense amount"
                />
                {form.formState.errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Category</label>
                <Select
                  onValueChange={(value) => form.setValue("category", value)}
                  defaultValue={form.getValues("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="internet">Internet</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="others">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Payment Method</label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("paymentMethod", value)
                  }
                  defaultValue={form.getValues("paymentMethod")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">Bkash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {expenseSlug ? "Updating..." : "Creating..."}
                  </>
                ) : expenseSlug ? (
                  "Update Expense"
                ) : (
                  "Create Expense"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateExpense = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateExpenseForm />
    </Suspense>
  );
};

export default CreateExpense;
