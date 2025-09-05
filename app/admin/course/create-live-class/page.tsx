"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axios";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Please enter a valid URL"),
  status: z.enum(["Published", "Draft"]),
});

type FormValues = z.infer<typeof formSchema>;

const LiveClassForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const liveClassId = searchParams.get("id");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    const fetchLiveClass = async () => {
      if (liveClassId) {
        try {
          setIsFetching(true);
          const response = await axiosInstance.get(`/live-class/${liveClassId}`);
          const liveClass = response.data?.data;
          
          form.reset({
            title: liveClass.title,
            description: liveClass.description,
            link: liveClass.link,
            status: liveClass.status,
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to fetch live class",
            variant: "destructive",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchLiveClass();
  }, [liveClassId, form, toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      if (liveClassId) {
        // Update existing live class
        const response = await axiosInstance.patch(`/live-class/${liveClassId}`, {
          ...values,
          courseId,
        });

        if (response.data) {
          toast({
            title: "Success",
            description: "Live class updated successfully",
          });
          router.back();
        }
      } else {
        // Create new live class
        const response = await axiosInstance.post("/live-class/create-liveClass", {
          ...values,
          courseId,
          createdBy: "67e3c168090544c12eaa0b26", // This should be replaced with the actual user ID
        });

        if (response.data) {
          toast({
            title: "Success",
            description: "Live class created successfully",
          });
          router.back();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!courseId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course ID not found</h1>
          <Link href="/admin/course">
            <Button variant="outline">Go back to courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/course/${courseId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">
          {liveClassId ? "Edit Live Class" : "Create Live Class"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter live class title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter live class description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Live Class Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/live-class"
                    {...field}
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
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Link href={`/admin/course/${courseId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {liveClassId ? "Update Live Class" : "Create Live Class"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const CreateLiveClassPage = () => {
  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <LiveClassForm />
      </Suspense>
    </div>
  );
};

export default CreateLiveClassPage;