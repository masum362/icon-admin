"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  X,
  Upload,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Image as ImageIcon,
} from "lucide-react";
import axiosInstance from "@/utils/axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "@/utils/apis/uploadImage";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Define the form schema with Zod
const formSchema = z.object({
  question: z.string().min(5, {
    message: "Question must be at least 5 characters.",
  }),
  questionImg: z.string().optional(),
  options: z.array(z.string()).min(2, {
    message: "At least 2 options are required.",
  }),
  correctAnswer: z.string().min(1, {
    message: "Correct answer is required.",
  }),
  explaination: z.string().optional(),
  tags: z.array(z.string()).optional(),
  subject: z.string().optional(),
});

// Utility to remove empty fields
function removeEmptyFields(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
    )
  );
}

const CreateMCQForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const moduleId = searchParams.get("moduleId");
  const courseId = searchParams.get("courseId");
  const mcqId = searchParams.get("id");
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isLoadingMCQ, setIsLoadingMCQ] = useState(false);
  const [mcqDataLoaded, setMcqDataLoaded] = useState(false);
  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your question here...",
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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[100px] p-2",
      },
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

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      questionImg: "",
      options: [],
      correctAnswer: "",
      explaination: "",
      tags: [],
      subject: "",
    },
  });

  // Add effect to update form question when editor content changes
  useEffect(() => {
    if (editor) {
      const updateFormQuestion = () => {
        const content = editor.getHTML();
        form.setValue("question", content);
      };

      editor.on("update", updateFormQuestion);
      return () => {
        editor.off("update", updateFormQuestion);
      };
    }
  }, [editor, form]);

  // Set editor content when it becomes ready and we have data
  useEffect(() => {
    if (editor && mcqDataLoaded && mcqId) {
      const questionContent = form.getValues("question");
      if (questionContent && questionContent !== editor.getHTML()) {
        editor.commands.setContent(questionContent);
      }
    }
  }, [editor, mcqDataLoaded, mcqId, form]);

  // Alternative approach: Watch for form changes and update editor
  useEffect(() => {
    if (editor && mcqId) {
      const subscription = form.watch((value, { name }) => {
        if (
          name === "question" &&
          value.question &&
          value.question !== editor.getHTML()
        ) {
          editor.commands.setContent(value.question);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [editor, form, mcqId]);

  // Sync questionImg form field with preview
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "questionImg") {
        const imgUrl = value.questionImg;
        if (imgUrl && imgUrl !== questionImageUrl) {
          setQuestionImageUrl(imgUrl);
        } else if (!imgUrl && questionImageUrl) {
          setQuestionImageUrl(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, questionImageUrl]);

  // Fetch and prefill MCQ if editing
  useEffect(() => {
    const fetchMCQ = async () => {
      if (!mcqId) return;
      setIsLoadingMCQ(true);
      setMcqDataLoaded(false);
      try {
        const response = await axiosInstance.get(`/mcq/single/${mcqId}`);
        const data = response.data.data;

        // Reset form with fetched data
        form.reset({
          question: data.question || "",
          questionImg: data.questionImg || "",
          options: data.options || [],
          correctAnswer: data.correctAnswer || "",
          explaination: data.explaination || "",
          tags: data.tags || [],
          subject: data.subject || "",
        });

        // Set question image URL state if exists
        if (data.questionImg) {
          setQuestionImageUrl(data.questionImg);
        }

        // Mark data as loaded
        setMcqDataLoaded(true);

        // Set editor content after a small delay to ensure form is updated
        setTimeout(() => {
          if (editor && data.question) {
            editor.commands.setContent(data.question);
          }
        }, 100);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch MCQ data",
        });
      } finally {
        setIsLoadingMCQ(false);
      }
    };

    fetchMCQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mcqId, editor]);

  // Add image to editor
  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!examId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Exam ID is required",
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID is required",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Remove empty fields
      const payload = removeEmptyFields({
        ...values,
        question: editor?.getHTML() || values.question,
        examId,
        insertBy: userId,
      });

      if (mcqId) {
        // Update MCQ
        await axiosInstance.patch(`/mcq/${mcqId}`, payload);
        toast({
          title: "MCQ updated successfully",
          description: "The MCQ has been updated",
        });
      } else {
        // Create MCQ
        await axiosInstance.post("/mcq/create-mcq", payload);
        toast({
          title: "MCQ created successfully",
          description: "The MCQ has been added to the exam",
        });
      }

      // Redirect back to the exam details page
      router.back();
    } catch (error: any) {
      console.error("Error creating/updating MCQ:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new option
  const addOption = () => {
    if (optionInput.trim() === "") return;

    const currentOptions = form.getValues("options") || [];
    if (currentOptions.includes(optionInput.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This option already exists",
      });
      return;
    }

    form.setValue("options", [...currentOptions, optionInput.trim()]);
    setOptionInput("");
  };

  // Remove an option
  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options") || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    form.setValue("options", newOptions);

    // If the removed option was the correct answer, clear it
    if (form.getValues("correctAnswer") === currentOptions[index]) {
      form.setValue("correctAnswer", "");
    }
  };

  // Add a new tag
  const addTag = () => {
    if (tagInput.trim() === "") return;

    const currentTags = form.getValues("tags") || [];
    if (currentTags.includes(tagInput.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This tag already exists",
      });
      return;
    }

    form.setValue("tags", [...currentTags, tagInput.trim()]);
    setTagInput("");
  };

  // Remove a tag
  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags") || [];
    const newTags = currentTags.filter((_, i) => i !== index);
    form.setValue("tags", newTags);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      uploadImage(file, {
        onSuccess: (imageUrl) => {
          if (imageUrl) {
            setQuestionImageUrl(imageUrl);
            form.setValue("questionImg", imageUrl);
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

  if (!editor) {
    return null;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <CardTitle>
                {mcqId
                  ? "Update Multiple Choice Question"
                  : "Create Multiple Choice Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMCQ ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* Question Field */}
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <div className="border rounded-md overflow-hidden">
                              <div className="border-b p-2 flex gap-2 flex-wrap bg-gray-50">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor?.chain().focus().toggleBold().run()
                                  }
                                  className={
                                    editor?.isActive("bold")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor?.chain().focus().toggleItalic().run()
                                  }
                                  className={
                                    editor?.isActive("italic")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor?.chain().focus().toggleStrike().run()
                                  }
                                  className={
                                    editor?.isActive("strike")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <Strikethrough className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor
                                      ?.chain()
                                      .focus()
                                      .toggleBulletList()
                                      .run()
                                  }
                                  className={
                                    editor?.isActive("bulletList")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor
                                      ?.chain()
                                      .focus()
                                      .toggleOrderedList()
                                      .run()
                                  }
                                  className={
                                    editor?.isActive("orderedList")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor
                                      ?.chain()
                                      .focus()
                                      .toggleBlockquote()
                                      .run()
                                  }
                                  className={
                                    editor?.isActive("blockquote")
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  <Quote className="h-4 w-4" />
                                </Button>
                                <Dialog
                                  open={isImageDialogOpen}
                                  onOpenChange={setIsImageDialogOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={
                                        editor?.isActive("image")
                                          ? "bg-gray-200"
                                          : ""
                                      }
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Insert Image</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="imageUrl">
                                          Image URL
                                        </Label>
                                        <Input
                                          id="imageUrl"
                                          value={imageUrl}
                                          onChange={(e) =>
                                            setImageUrl(e.target.value)
                                          }
                                          placeholder="Enter image URL"
                                        />
                                      </div>
                                      <Button onClick={addImage}>
                                        Insert Image
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor?.chain().focus().undo().run()
                                  }
                                  disabled={!editor?.can().undo()}
                                >
                                  <Undo className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    editor?.chain().focus().redo().run()
                                  }
                                  disabled={!editor?.can().redo()}
                                >
                                  <Redo className="h-4 w-4" />
                                </Button>
                              </div>
                              <EditorContent editor={editor} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Question Image Field */}
                    <FormField
                      control={form.control}
                      name="questionImg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Image (Optional)</FormLabel>
                          <FormControl>
                            {questionImageUrl ? (
                              <div className="space-y-2">
                                <div className="relative aspect-video rounded-md overflow-hidden mb-4">
                                  <img
                                    src={questionImageUrl}
                                    alt="Question"
                                    className="w-full h-full object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      setQuestionImageUrl(null);
                                      form.setValue("questionImg", "");
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Image URL or upload an image"
                                    {...field}
                                  />
                                  <div className="relative">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id="image-upload"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleImageUpload(file);
                                        }
                                      }}
                                      disabled={isUploading}
                                    />
                                    <label
                                      htmlFor="image-upload"
                                      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md flex items-center"
                                    >
                                      {isUploading ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                        <Upload className="h-4 w-4 mr-1" />
                                      )}
                                      Upload
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Image URL or upload an image"
                                  {...field}
                                />
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-upload"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        await handleImageUpload(file);
                                      }
                                    }}
                                    disabled={isUploading}
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md flex items-center"
                                  >
                                    {isUploading ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4 mr-1" />
                                    )}
                                    Upload
                                  </label>
                                </div>
                              </div>
                            )}
                          </FormControl>
                          <FormDescription>
                            You can provide an image URL or upload an image for
                            the question.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Options Field */}
                    <FormField
                      control={form.control}
                      name="options"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Options</FormLabel>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add an option"
                                value={optionInput}
                                onChange={(e) => setOptionInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addOption();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addOption}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value?.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md"
                                >
                                  <span>{option}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Correct Answer Field */}
                    <FormField
                      control={form.control}
                      name="correctAnswer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the correct answer"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The correct answer must match one of the options
                            exactly.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Explanation Field */}
                    <FormField
                      control={form.control}
                      name="explaination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why this is the correct answer..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags Field */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Optional)</FormLabel>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add a tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addTag}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value?.map((tag, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md"
                                >
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject Field */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {mcqId ? "Updating..." : "Creating..."}
                          </>
                        ) : mcqId ? (
                          "Update MCQ"
                        ) : (
                          "Create MCQ"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CreateMCQ = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateMCQForm />
    </Suspense>
  );
};

export default CreateMCQ;
