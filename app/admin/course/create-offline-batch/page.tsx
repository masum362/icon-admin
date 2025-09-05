"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CreateOfflineBatchContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get("id");
  const courseId = searchParams.get("courseId");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [form, setForm] = useState({
    name: "",
  });

  // Fetch batch if editing
  useEffect(() => {
    const fetchBatch = async () => {
      if (!batchId) return;
      setIsFetching(true);
      try {
        const { data } = await axiosInstance.get(`/offline-batch/${batchId}`);
        setForm({
          name: data.data.name || "",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch batch data",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !courseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Batch name is required",
      });
      return;
    }
    setIsLoading(true);
    try {
      if (batchId) {
        // Update
        await axiosInstance.patch(`/offline-batch/${batchId}`, {
          ...form,
          courseId,
        });
        toast({ title: "Batch updated successfully" });
      } else {
        // Create
        await axiosInstance.post("/offline-batch/create-offline-batch", {
          ...form,
          courseId,
        });
        toast({ title: "Batch created successfully" });
      }
      router.back();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>
                {batchId ? "Update Offline Batch" : "Create Offline Batch"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block mb-1 font-medium">Batch Name</label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter batch name"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {batchId ? "Updating..." : "Creating..."}
                        </>
                      ) : batchId ? (
                        "Update Batch"
                      ) : (
                        "Create Batch"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CreateOfflineBatch = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateOfflineBatchContent />
    </Suspense>
  );
};

export default CreateOfflineBatch;
