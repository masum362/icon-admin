"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourseList } from "@/utils/apis/getCourseList";
import { useUniversityList } from "@/utils/apis/getUniversityList";
import ModuleDetails from "../../course/module/[id]/page";

// Define the form schema
const formSchema = z.object({
  moduleTitle: z.string().min(3, {
    message: "Module title must be at least 3 characters.",
  }),
  courseId: z.string().min(1, {
    message: "Course ID is required.",
  }),
  universityId: z.string().min(1, {
    message: "University is required."
  })
});

const ModuleForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("id");
  const moduleSlug = searchParams.get("moduleslug");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { data: courseData, isLoading: isCourseListLoading } =
    useCourseList(100, 1);
  const { data: universityData, isLoading: isUniversityListLoading } =
    useUniversityList();
  const courses = courseData?.data || [];
  const universities = universityData?.data || [];
  // console.log(universities);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleTitle: "",
      courseId: "",
      universityId: "",
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
  }, []);

  // Fetch module data if editing
  useEffect(() => {
    const fetchModule = async () => {
      if (moduleId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(
            `/module/single/${moduleSlug}`
          );
          const module = response.data.data;

          // Set form values
          form.reset({
            courseId: module?.courseId?._id || "",
            universityId: module?.universityId?._id || "",
            moduleTitle: module?.moduleTitle || "",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching module",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchModule();
  }, [moduleId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is required",
      });
      return;
    }

    setIsLoading(true);
    try {
      const moduleData = {
        ...values,
        createdBy: userId,
      };

      
      if (moduleId) {
        // Update existing module
        await axiosInstance.patch(`/module/${moduleSlug}`, { ...moduleData });
        toast({
          title: "Module updated successfully",
          description: "The module has been updated",
        });
      } else {
        // Create new module
        await axiosInstance.post("/module/create-module", moduleData);
        toast({
          title: "Module created successfully",
          description: "The module has been added to the course",
        });
      }

      // Redirect back to the course details page
      router.back();
    } catch (error: any) {
      console.error("Error saving module:", error);
      toast({
        variant: "destructive",
        title: moduleId ? "Error updating module" : "Error creating module",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use form.watch() to get the current selected IDs
  const watchedCourseId = form.watch("courseId");
  const watchedUniversityId = form.watch("universityId");

  // Find the corresponding names for the watched IDs
  const selectedCourseName = watchedCourseId ? courses.find((c: any) => c._id === watchedCourseId)?.course_title : null;
  const selectedUniversityName = watchedUniversityId ? universities.find((u: any) => u._id === watchedUniversityId)?.name : null;


  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-6">
        <h6 className="card-title mb-4">
          {moduleId ? "Edit Module" : "Create New Module"}
        </h6>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="col-span-full lg:col-span-6 space-y-2">
            <Label htmlFor="course_type">Course Name *</Label>
            <Select
              disabled={isFetching || isCourseListLoading}
              onValueChange={(value) => form.setValue("courseId", value)}
              defaultValue={form.getValues("courseId")}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCourseName || "Select course"} />
              </SelectTrigger>
              <SelectContent>
                {courses.map(

                  (course: { _id: string; course_title: string }) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.course_title}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.courseId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.courseId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleTitle">Module Title *</Label>
            <Input
              id="moduleTitle"
              placeholder="Enter module title"
              {...form.register("moduleTitle")}
              disabled={isLoading || isFetching}
            />
            {form.formState.errors.moduleTitle && (
              <p className="text-sm text-red-500">
                {form.formState.errors.moduleTitle.message}
              </p>
            )}
          </div>

          <div className="col-span-full lg:col-span-6 space-y-2">
            <Label htmlFor="course_type">University Name *</Label>
            <Select
              disabled={isFetching || isUniversityListLoading}
              onValueChange={(value) => form.setValue("universityId", value)}
              defaultValue={form.getValues("universityId")}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedUniversityName || "Select University"} />
              </SelectTrigger>
              <SelectContent>

                {universities.length > 0 && universities.map(
                  (university: { _id: string; name: string }) => (
                    <SelectItem key={university._id} value={university._id}>
                      {university.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.universityId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.universityId.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading || isFetching}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isFetching}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {moduleId ? "Update Module" : "Create Module"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateModule = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ModuleForm />
    </Suspense>
  );
};

export default CreateModule;
