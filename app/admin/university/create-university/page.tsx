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
import { useUniversityList } from "@/utils/apis/getUniversityList";

// Define the form schema
const formSchema = z.object({
    name: z.string().min(3, {
        message: "University name required.",
    }),
    total_subject: z.string().min(1, {
        message: "Total subject is required.",
    }),
    status: z.string().min(1, {
        message: "Status is required."
    })
});

const UniversityForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const universityId = searchParams.get("id");
    const universitySlug = searchParams.get("universityslug");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const { data: universityData, isLoading: isUniversityListLoading } =
        useUniversityList(100, 1);
    const universities = universityData?.data || [];
    console.log(universities);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            total_subject: "",
            status: "",
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

    // Fetch university data if editing
    useEffect(() => {
        const fetchuniversity = async () => {
            if (universityId) {
                setIsFetching(true);
                try {
                    const response = await axiosInstance.get(
                        `/university/${universitySlug}`
                    );
                    const university = response.data.data;

                    // Set form values
                    form.reset({
                        name: university?.name || "",
                        total_subject: String(university?.total_subject) || "",
                        status: university?.status || "",
                    });
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Error fetching university",
                        description:
                            error.response?.data?.message || "Something went wrong",
                    });
                } finally {
                    setIsFetching(false);
                }
            }
        };

        fetchuniversity();
    }, [universityId, form]);

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
            const universityData = {
                name: values.name,
                total_subject: parseInt(values.total_subject, 10),
                status: values.status,
                createdBy: userId,
            }
            if (universityId) {
                // Update existing university
                await axiosInstance.patch(`/university/${universitySlug}`, { ...universityData });
                toast({
                    title: "university updated successfully",
                    description: "The university has been updated",
                });
            } else {
                // Create new university
                await axiosInstance.post("/university/create-university", universityData);
                toast({
                    title: "University created successfully",
                    description: "The university has been added to the course",
                });
            }

            // Redirect back to the course details page
            router.back();
        } catch (error: any) {
            console.error("Error saving university:", error);
            toast({
                variant: "destructive",
                title: universityId ? "Error updating university" : "Error creating university",
                description: error.response?.data?.message || "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
            <div className="card p-6">
                <h6 className="card-title mb-4">
                    {universityId ? "Edit University" : "Create New University"}
                </h6>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="col-span-full lg:col-span-6 space-y-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">University Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter university name"
                                {...form.register("name")}
                                disabled={isLoading || isFetching}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="total_subject">Total Subject *</Label>
                        <Input
                            id="total_subject"
                            type="number"
                            placeholder="Enter total subject"
                            {...form.register("total_subject")}
                            disabled={isLoading || isFetching}
                        />
                        {form.formState.errors.total_subject && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.total_subject.message}
                            </p>
                        )}
                    </div>

                    <div className="col-span-full lg:col-span-6 space-y-2">
                        <Label htmlFor="course_type">University Status *</Label>
                        <Select
                            disabled={isFetching || isUniversityListLoading}
                            onValueChange={(value) => form.setValue("status", value)}
                            defaultValue={form.getValues("status")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={form.getValues("status") || "Select Status"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.status && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.status.message}
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
                            {universityId ? "Update university" : "Create university"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateUniversity = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <UniversityForm />
        </Suspense>
    );
};

export default CreateUniversity;
