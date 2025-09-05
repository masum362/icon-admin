"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Loader2,
} from "lucide-react";
import ImageUpload from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadImage } from "@/utils/apis/uploadImage";
import { useCourseCategoryList } from "@/utils/apis/getCourseCategory";
import axiosInstance from "@/utils/axios";
import { toast } from "@/hooks/use-toast";

const timeUnits = [
  { value: "Day", label: "Day" },
  { value: "Week", label: "Week" },
  { value: "Month", label: "Month" },
  { value: "Year", label: "Year" },
];

const formSchema = z.object({
  course_title: z.string().min(2, "Course title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().min(1, "Duration is required"),
  durationUnit: z.string().min(1, "Duration unit is required"),
  price: z.string().min(1, "Price is required"),
  offerPrice: z.string().optional(),
  preOrder: z.enum(["on", "off"]),
  course_type: z.string().min(1, "Course type is required"),
  category: z.string().min(1, "Category is required"),
  expireTime: z.string().min(1, "Expire time is required"),
  expireTimeUnit: z.string().min(1, "Expire time unit is required"),
  daySchedule: z.array(z.string()).optional(),
  timeShedule: z.array(z.record(z.array(z.string().length(5)))).optional(),
  takeReview: z.enum(["on", "off"]),
  prefix: z.string().min(2, "Course prefix must be at least 2 characters"),
  course_tag: z.array(z.string()).optional(),
  thumbnail: z.any().optional(),
  routine: z.any().optional(), // New field for routine image
  isFree: z.boolean(), // Changed to boolean
});

const courseTypes = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const durations = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "12", label: "12 Months" },
  { value: "24", label: "24 Months" },
  { value: "36", label: "36 Months" },
];

const days = [
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const times = [
  { value: "10:00 AM", label: "10:00 AM" },
  { value: "11:00 AM", label: "11:00 AM" },
  { value: "12:00 PM", label: "12:00 PM" },
  { value: "01:00 PM", label: "01:00 PM" },
  { value: "02:00 PM", label: "02:00 PM" },
  { value: "03:00 PM", label: "03:00 PM" },
  { value: "04:00 PM", label: "04:00 PM" },
  { value: "05:00 PM", label: "05:00 PM" },
  { value: "06:00 PM", label: "06:00 PM" },
  { value: "07:00 PM", label: "07:00 PM" },
  { value: "08:00 PM", label: "08:00 PM" },
  { value: "09:00 PM", label: "09:00 PM" },
];

const parseTimeValue = (value: string) => {
  if (!value) return { number: "", unit: "Month" };

  // Split the value into number and unit
  const parts = value.trim().split(" ");
  if (parts.length !== 2) return { number: "", unit: "Month" };

  const number = parts[0];
  const unit =
    parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();

  console.log("Parsing time value:", { value, parts, unit }); // Debug log

  // Validate if the unit is one of our allowed units (case-insensitive)
  const validUnit = timeUnits.find(
    (u) => u.value.toLowerCase() === unit.toLowerCase()
  );

  console.log("Found valid unit:", validUnit); // Debug log

  return {
    number,
    unit: validUnit ? validUnit.value : "Month",
  };
};

const CreateCourseForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [routineImageUrl, setRoutineImageUrl] = useState<string | null>(null); // New state for routine image
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [dailyScheduleTimes, setDailyScheduleTimes] = useState<
    Record<string, [string, string]>
  >({});
  const [courseTags, setCourseTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { data: categoryData, isLoading: isCategoryLoading } =
    useCourseCategoryList(100, 1);
  const categories = categoryData?.data || [];
  const [isCourseFree, setIsCourseFree] = useState(false); // State for isFree, default to false

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_title: "",
      description: "",
      duration: "",
      durationUnit: "Month",
      price: "",
      offerPrice: "",
      preOrder: "off",
      course_type: "",
      category: "",
      expireTime: "1",
      expireTimeUnit: "Month",
      daySchedule: [],
      timeShedule: [],
      takeReview: "on",
      prefix: "",
      course_tag: [],
      thumbnail: undefined,
      routine: undefined, // Default value for routine image
      isFree: false, // Default value for isFree
    },
  });

  // Add form validation debugging
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your course description here...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-2",
      },
    },
  });

  // Sync editor content with form
  useEffect(() => {
    if (editor) {
      const updateFormDescription = () => {
        const content = editor.getHTML();
        form.setValue("description", content);
      };

      editor.on("update", updateFormDescription);
      return () => {
        editor.off("update", updateFormDescription);
      };
    }
  }, [editor, form]);

  // Fetch course data if editing
  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(`/course/${courseId}`);
          const course = response.data.data;

          // Parse duration and expire time
          const durationParts = parseTimeValue(course.duration);
          const expireTimeParts = parseTimeValue(course.expireTime);

          // Prepare daily schedule times from fetched data
          const fetchedDailyScheduleTimes: Record<string, [string, string]> =
            {};
          if (course.timeShedule && Array.isArray(course.timeShedule)) {
            course.timeShedule.forEach((item: any) => {
              const day = Object.keys(item)[0];
              const times = item[day];
              if (day && Array.isArray(times) && times.length === 2) {
                fetchedDailyScheduleTimes[day] = [times[0], times[1]];
              }
            });
          }

          // Set form values
          form.reset({
            course_title: course.course_title || "",
            description: course.description || "",
            duration: durationParts.number,
            durationUnit: durationParts.unit,
            price: course.price?.toString() || "",
            offerPrice: course.offerPrice?.toString() || "",
            preOrder: course.preOrder || "off",
            course_type: course.course_type || "",
            category: course.category?._id || "",
            expireTime: expireTimeParts.number,
            expireTimeUnit: expireTimeParts.unit,
            daySchedule: course.daySchedule || [],
            takeReview: course.takeReview || "on",
            prefix: course.prefix || "",
            course_tag: course.course_tag || [],
            isFree:
              course.isFree === true ||
              course.isFree === "true" ||
              course.isFree === "on", // Convert to boolean
          });

          // Set editor content
          if (course.description && editor) {
            editor.commands.setContent(course.description);
          }

          // Set cover photo URL
          if (course.cover_photo) {
            setCoverPhotoUrl(course.cover_photo);
          }
          // Set routine photo URL
          if (course.routine) {
            setRoutineImageUrl(course.routine);
          }

          // Set selected days and times
          if (course.daySchedule) {
            setSelectedDays(course.daySchedule);
          }
          setDailyScheduleTimes(fetchedDailyScheduleTimes);
          if (course.course_tag) {
            setCourseTags(course.course_tag);
          }

          // Set isFree value
          setIsCourseFree(
            course.isFree === true ||
              course.isFree === "true" ||
              course.isFree === "on"
          ); // Convert to boolean
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error fetching course",
            description:
              error.response?.data?.message || "Something went wrong",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCourse();
  }, [courseId, form, editor]);

  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          if (imageUrl) {
            setCoverPhotoUrl(imageUrl);
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error uploading image",
            description: "Failed to upload the image. Please try again.",
          });
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: "Failed to upload the image. Please try again.",
      });
    }
  };

  const handleRoutineImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          if (imageUrl) {
            setRoutineImageUrl(imageUrl);
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error uploading routine image",
            description:
              "Failed to upload the routine image. Please try again.",
          });
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading routine image",
        description: "Failed to upload the routine image. Please try again.",
      });
    }
  };

  const handleDayToggle = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updatedDays);
    form.setValue("daySchedule", updatedDays);

    // Update dailyScheduleTimes
    setDailyScheduleTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      if (updatedDays.includes(day)) {
        // Day is selected, initialize its times if not already present
        if (!newTimes[day]) {
          newTimes[day] = ["", ""]; // Default empty times
        }
      } else {
        // Day is deselected, remove its times
        delete newTimes[day];
      }
      return newTimes;
    });
  };

  const handleTimeChange = (
    day: string,
    time: string,
    type: "start" | "end"
  ) => {
    setDailyScheduleTimes((prevTimes) => {
      const newTimes = { ...prevTimes };
      const currentDayTimes = newTimes[day] || ["", ""];

      if (type === "start") {
        currentDayTimes[0] = time;
        // If end time is before new start time, reset end time
        if (currentDayTimes[1] && time > currentDayTimes[1]) {
          currentDayTimes[1] = "";
        }
      } else {
        // Only allow end time if start time is selected and end time is after start time
        if (currentDayTimes[0] && time > currentDayTimes[0]) {
          currentDayTimes[1] = time;
        } else if (!currentDayTimes[0]) {
          toast({
            variant: "destructive",
            title: "Invalid selection",
            description: "Please select start time first for this day",
          });
          return prevTimes;
        } else {
          toast({
            variant: "destructive",
            title: "Invalid selection",
            description: "End time must be after start time for this day",
          });
          return prevTimes;
        }
      }
      newTimes[day] = currentDayTimes;
      return newTimes;
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !courseTags.includes(tagInput.trim())) {
      const updatedTags = [...courseTags, tagInput.trim()];
      setCourseTags(updatedTags);
      form.setValue("course_tag", updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = courseTags.filter((t) => t !== tag);
    setCourseTags(updatedTags);
    form.setValue("course_tag", updatedTags);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    console.log("Editor content:", editor?.getHTML());

    // Validate description from editor
    const description = editor?.getHTML() || values.description;
    if (!description || description.length < 10) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Description must be at least 10 characters long",
      });
      return;
    }

    // Prepare timeShedule in the new format
    const formattedTimeSchedule = Object.keys(dailyScheduleTimes)
      .filter((day) => selectedDays.includes(day)) // Only include selected days
      .map((day) => {
        const times = dailyScheduleTimes[day];
        return { [day]: times };
      });

    setIsLoading(true);
    try {
      // Get the current user ID
      const userResponse = await axiosInstance.get("/user/profile");
      const userId = userResponse.data.data._id;

      // Combine duration and expire time with their units
      const combinedDuration = `${values.duration} ${values.durationUnit}`;
      const combinedExpireTime = `${values.expireTime} ${values.expireTimeUnit}`;

      // Prepare data for API
      const courseData = {
        course_title: values.course_title,
        description: description,
        duration: combinedDuration,
        price: parseFloat(values.price),
        offerPrice: values.offerPrice ? parseFloat(values.offerPrice) : 0,
        preOrder: values.preOrder,
        course_type: values.course_type,
        category: values.category,
        createdBy: userId,
        expireTime: combinedExpireTime,
        daySchedule: values.daySchedule,
        timeShedule: formattedTimeSchedule, // Use the new formatted schedule
        takeReview: values.takeReview,
        prefix: values.prefix,
        course_tag: values.course_tag,
        cover_photo: coverPhotoUrl || "",
        status: "active",
        routine: routineImageUrl || "", // Include routine image URL
        isFree: values.isFree, // Include isFree value
      };

      console.log("Submitting course data:", courseData);

      // Create or update course
      if (courseId) {
        await axiosInstance.patch(`/course/${courseId}`, courseData);
        toast({
          title: "Course updated successfully",
          description: "The course information has been updated",
        });
      } else {
        await axiosInstance.post("/course/create-course", courseData);
        toast({
          title: "Course created successfully",
          description: "A new course has been added to the system",
        });
      }

      // Redirect to course list
      router.push("/admin/course/all-course");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: courseId ? "Error updating course" : "Error creating course",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle price and offer price when course is free
  useEffect(() => {
    if (isCourseFree === true) {
      form.setValue("price", "0");
      form.setValue("offerPrice", "0");
    }
  }, [isCourseFree, form]);

  if (!editor) {
    return null;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-full lg:col-span-7 card p-4 lg:p-6">
            <h6 className="card-title">
              {courseId ? "Edit Course" : "Add New Course"}
            </h6>
            <div className="grid grid-cols-12 gap-x-4 gap-y-5 mt-7 pt-0.5">
              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="course_title">Course Title *</Label>
                <Input
                  id="course_title"
                  placeholder="Course Title"
                  {...form.register("course_title")}
                  disabled={isFetching}
                />
                {form.formState.errors.course_title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.course_title.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="course_type">Course Type *</Label>
                <Select
                  disabled={isFetching}
                  onValueChange={(value) => form.setValue("course_type", value)}
                  defaultValue={form.getValues("course_type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.course_type && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.course_type.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  disabled={isFetching || isCategoryLoading}
                  onValueChange={(value) => form.setValue("category", value)}
                  defaultValue={form.getValues("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(
                      (category: { _id: string; title: string }) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration"
                    {...form.register("duration")}
                    disabled={isFetching}
                    className="flex-1"
                  />
                  <Select
                    disabled={isFetching}
                    onValueChange={(value) =>
                      form.setValue("durationUnit", value)
                    }
                    value={form.watch("durationUnit")}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.duration && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.duration.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="expireTime">Expiration Time *</Label>
                <div className="flex gap-2">
                  <Input
                    id="expireTime"
                    type="number"
                    placeholder="Enter expire time"
                    {...form.register("expireTime")}
                    disabled={isFetching}
                    className="flex-1"
                  />
                  <Select
                    disabled={isFetching}
                    onValueChange={(value) =>
                      form.setValue("expireTimeUnit", value)
                    }
                    value={form.watch("expireTimeUnit")}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.expireTime && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.expireTime.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="isFree">Is Free?</Label>
                <Select
                  disabled={isFetching}
                  onValueChange={(value) => {
                    const boolValue = value === "true";
                    form.setValue("isFree", boolValue);
                    setIsCourseFree(boolValue);
                  }}
                  value={isCourseFree.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.isFree && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.isFree.message}
                  </p>
                )}
              </div>

              {isCourseFree === false && (
                <div className="col-span-full lg:col-span-6 space-y-2">
                  <Label htmlFor="price">Price (৳) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    {...form.register("price")}
                    disabled={isFetching}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>
              )}

              {isCourseFree === false && (
                <div className="col-span-full lg:col-span-6 space-y-2">
                  <Label htmlFor="offerPrice">Offer Price (৳)</Label>
                  <Input
                    id="offerPrice"
                    type="number"
                    placeholder="0.00"
                    {...form.register("offerPrice")}
                    disabled={isFetching}
                  />
                  {form.formState.errors.offerPrice && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.offerPrice.message}
                    </p>
                  )}
                </div>
              )}

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="preOrder">Pre-order</Label>
                <Select
                  disabled={isFetching}
                  onValueChange={(value) =>
                    form.setValue("preOrder", value as "on" | "off")
                  }
                  defaultValue={form.getValues("preOrder")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pre-order option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.preOrder && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.preOrder.message}
                  </p>
                )}
              </div>

              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="takeReview">Take Review</Label>
                <Select
                  disabled={isFetching}
                  onValueChange={(value) =>
                    form.setValue("takeReview", value as "on" | "off")
                  }
                  defaultValue={form.getValues("takeReview")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select review option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.takeReview && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.takeReview.message}
                  </p>
                )}
              </div>
              <div className="col-span-full lg:col-span-6 space-y-2">
                <Label htmlFor="prefix">Course Prefix *</Label>
                <Input
                  id="prefix"
                  placeholder="Course Prefix"
                  {...form.register("prefix")}
                  disabled={isFetching}
                />
                {form.formState.errors.prefix && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.prefix.message}
                  </p>
                )}
              </div>

              <div className="col-span-full space-y-2">
                <Label>Course Description *</Label>
                <div className="border rounded-md">
                  <div className="flex flex-wrap gap-1 p-2 border-b">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={editor.isActive("bold") ? "bg-muted" : ""}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={editor.isActive("italic") ? "bg-muted" : ""}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      className={editor.isActive("strike") ? "bg-muted" : ""}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={
                        editor.isActive("bulletList") ? "bg-muted" : ""
                      }
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={
                        editor.isActive("orderedList") ? "bg-muted" : ""
                      }
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                      className={
                        editor.isActive("blockquote") ? "bg-muted" : ""
                      }
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="col-span-full space-y-2">
                <Label>Course Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {courseTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              {/* <div className="col-span-full space-y-2">
                <Label>Schedule</Label>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-4">
                    <Label className="text-base font-semibold">Day</Label>
                    <Label className="text-base font-semibold">Time</Label>
                  </div>
                  {days.map((day) => (
                    <div
                      key={day.value}
                      className="grid grid-cols-2 gap-4 items-center py-2 border-b last:border-b-0"
                    >
                      <div>
                        <Button
                          type="button"
                          variant={
                            selectedDays.includes(day.value)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleDayToggle(day.value)}
                        >
                          {day.label}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Start Time</Label>
                          <Input
                            type="time"
                            value={dailyScheduleTimes[day.value]?.[0] || ""}
                            onChange={(e) =>
                              handleTimeChange(
                                day.value,
                                e.target.value,
                                "start"
                              )
                            }
                            className="w-full"
                            disabled={!selectedDays.includes(day.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">End Time</Label>
                          <Input
                            type="time"
                            value={dailyScheduleTimes[day.value]?.[1] || ""}
                            onChange={(e) =>
                              handleTimeChange(day.value, e.target.value, "end")
                            }
                            className="w-full"
                            disabled={
                              !selectedDays.includes(day.value) ||
                              !dailyScheduleTimes[day.value]?.[0]
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>

          <div className="col-span-full lg:col-span-5 card p-4 lg:p-6">
            <div className="p-1.5">
              <h6 className="card-title">Add media files</h6>
              <div className="mt-7 pt-0.5">
                <p className="text-xs text-gray-500 dark:text-dark-text-two leading-none font-semibold mb-3">
                  Thumbnail (548x234)
                </p>
                {coverPhotoUrl ? (
                  <div className="relative aspect-[4/1.5] rounded-md overflow-hidden mb-4">
                    <img
                      src={coverPhotoUrl}
                      alt="Course thumbnail"
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
                    htmlFor="thumbnail"
                    className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer aspect-[4/1.5] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square"
                  >
                    <input
                      type="file"
                      id="thumbnail"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("thumbnail", file);
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
                            <ImageUpload
                              src="/assets/images/icons/upload-file.svg"
                              alt="icon"
                              className="dark:brightness-200 dark:contrast-100 w-1/2 lg:w-auto"
                              height={25}
                              width={25}
                            />
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
              {/* Class Routine */}
              <div className="mt-7 pt-0.5">
                <p className="text-xs text-gray-500 dark:text-dark-text-two leading-none font-semibold mb-3">
                  Routine (548x234)
                </p>
                {routineImageUrl ? (
                  <div className="relative aspect-[4/1.5] rounded-md overflow-hidden mb-4">
                    <img
                      src={routineImageUrl}
                      alt="Routine thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setRoutineImageUrl(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="routine"
                    className="file-container ac-bg text-xs leading-none font-semibold mb-3 cursor-pointer aspect-[4/1.5] flex flex-col items-center justify-center gap-2.5 border border-dashed border-gray-900 dark:border-dark-border-four rounded-10 dk-theme-card-square"
                  >
                    <input
                      type="file"
                      id="routine"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("routine", file);
                          await handleRoutineImageUpload(file);
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
                            <ImageUpload
                              src="/assets/images/icons/upload-file.svg"
                              alt="icon"
                              className="dark:brightness-200 dark:contrast-100 w-1/2 lg:w-auto"
                              height={25}
                              width={25}
                            />
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
              <Button
                type="submit"
                className="mt-4"
                disabled={isLoading || isFetching || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {courseId ? "Updating..." : "Creating..."}
                  </>
                ) : courseId ? (
                  "Update Course"
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateCourse = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateCourseForm />
    </Suspense>
  );
};

export default CreateCourse;
