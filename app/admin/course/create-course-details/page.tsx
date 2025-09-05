"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInstructorListByRole } from "@/utils/apis/getInstructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MaterialIconPicker } from "@/components/ui/material-icons-picker";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// Rich text answer editor (module-scope -> stable identity)
const AnswerEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write answer..." }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "prose prose-sm min-h-[80px] p-2" },
    },
  });

  // Keep editor content in sync when parent value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Notify parent on updates
  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange(editor.getHTML());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onChange]);

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  if (!editor) return null;

  return (
    <div>
      <div className="border-b p-2 flex gap-2 flex-wrap bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200" : ""}
        >
          S
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        >
          •
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        >
          1.
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
        >
          ❝
        </Button>
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={editor.isActive("image") ? "bg-gray-200" : ""}
            >
              Img
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="answerImageUrl">Image URL</Label>
                <Input
                  id="answerImageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
              <Button onClick={addImage}>Insert Image</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          Redo
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

const CourseDetailsForm = () => {
  // ...existing code...
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const courseDetailsId = searchParams.get("courseDetailsId");
  const { data: instructors } = useInstructorListByRole(100, 1, "teacher");
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState({
    courseId: courseId || "",
    isCourseExist: [{ text: "", icon: "" }],
    courseDetails: [{ question: "", answer: [""] }],
    instructors: [] as string[],
  });

  // Fetch existing course details if in edit mode
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseDetailsId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(
            `/course-details/${courseId}`
          );
          const data = response.data.data;

          setFormData({
            courseId: data.courseId._id,
            isCourseExist:
              data.isCourseExist.length > 0
                ? data.isCourseExist
                : [{ text: "", icon: "" }],
            courseDetails:
              data.courseDetails.length > 0
                ? data.courseDetails
                : [{ question: "", answer: [""] }],
            instructors: data.instructors.map(
              (instructor: any) => instructor._id
            ),
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.response?.data?.message || "Failed to fetch course details",
          });
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCourseDetails();
  }, [courseDetailsId, toast]);

  const handleAddPrerequisite = () => {
    setFormData((prev) => ({
      ...prev,
      isCourseExist: [...prev.isCourseExist, { text: "", icon: "" }],
    }));
  };

  const handleRemovePrerequisite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      isCourseExist: prev.isCourseExist.filter((_, i) => i !== index),
    }));
  };

  const handleAddCourseDetail = () => {
    setFormData((prev) => ({
      ...prev,
      courseDetails: [...prev.courseDetails, { question: "", answer: [""] }],
    }));
  };

  const handleRemoveCourseDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      courseDetails: prev.courseDetails.filter((_, i) => i !== index),
    }));
  };

  const handleAddCourseDetailAnswer = (detailIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      courseDetails: prev.courseDetails.map((item, i) =>
        i === detailIndex ? { ...item, answer: [...item.answer, ""] } : item
      ),
    }));
  };

  const handleRemoveCourseDetailAnswer = (
    detailIndex: number,
    answerIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      courseDetails: prev.courseDetails.map((item, i) =>
        i === detailIndex
          ? {
              ...item,
              answer: item.answer.filter((_, j) => j !== answerIndex),
            }
          : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter out empty values
      const dataToSubmit = {
        ...formData,
        isCourseExist: formData.isCourseExist.filter(
          (item) => item.text && item.icon
        ),
        courseDetails: formData.courseDetails
          .filter((item) => item.question && item.answer.some(Boolean))
          .map((item) => ({
            question: item.question,
            answer: item.answer.filter(Boolean),
          })),
      };

      if (courseDetailsId) {
        // Update existing course details
        await axiosInstance.patch(
          `/course-details/${courseDetailsId}`,
          dataToSubmit
        );
        toast({
          title: "Success",
          description: "Course details updated successfully",
        });
      } else {
        // Create new course details
        await axiosInstance.post(
          "/course-details/create-course-details",
          dataToSubmit
        );
        toast({
          title: "Success",
          description: "Course details created successfully",
        });
      }

      router.push(`/admin/course/course-details/${courseId}`);
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

  if (!courseId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Course ID is required</p>
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {courseDetailsId ? "Update Course Details" : "Create Course Details"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Prerequisites */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">এই কোর্সে যা থাকছে</h2>
            <Button type="button" onClick={handleAddPrerequisite}>
              Add Item
            </Button>
          </div>
          {formData.isCourseExist.map((prereq, index) => (
            <div key={index} className="flex items-center gap-2">
              <MaterialIconPicker
                value={prereq.icon}
                onChange={(icon) =>
                  setFormData((prev) => ({
                    ...prev,
                    isCourseExist: prev.isCourseExist.map((item, i) =>
                      i === index ? { ...item, icon } : item
                    ),
                  }))
                }
              />
              <Input
                value={prereq.text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isCourseExist: prev.isCourseExist.map((item, i) =>
                      i === index ? { ...item, text: e.target.value } : item
                    ),
                  }))
                }
                placeholder="Enter item"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemovePrerequisite(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Course Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Details</h2>
            <Button type="button" onClick={handleAddCourseDetail}>
              Add Course Detail
            </Button>
          </div>
          {formData.courseDetails.map((item, detailIndex) => (
            <div key={detailIndex} className="space-y-4 border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Input
                  value={item.question}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      courseDetails: prev.courseDetails.map((detail, i) =>
                        i === detailIndex
                          ? { ...detail, question: e.target.value }
                          : detail
                      ),
                    }))
                  }
                  placeholder="Enter question"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveCourseDetail(detailIndex)}
                >
                  Remove
                </Button>
              </div>
              <div className="space-y-2">
                {item.answer.map((ans, answerIndex) => (
                  <div key={answerIndex} className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 border rounded-md overflow-hidden">
                        {/* Use a TipTap editor for rich text answers */}
                        <AnswerEditor
                          value={ans}
                          onChange={(html) =>
                            setFormData((prev) => ({
                              ...prev,
                              courseDetails: prev.courseDetails.map(
                                (detail, i) =>
                                  i === detailIndex
                                    ? {
                                        ...detail,
                                        answer: detail.answer.map((a, j) =>
                                          j === answerIndex ? html : a
                                        ),
                                      }
                                    : detail
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="w-24 flex-shrink-0">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            handleRemoveCourseDetailAnswer(
                              detailIndex,
                              answerIndex
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddCourseDetailAnswer(detailIndex)}
                >
                  Add Answer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructors */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Instructors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instructors?.data?.map((instructor: any) => (
              <div
                key={instructor._id}
                className={cn(
                  "border rounded-lg p-4 space-y-2 cursor-pointer transition-all duration-200",
                  formData.instructors.includes(instructor._id)
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-primary/50 hover:bg-primary/5"
                )}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    instructors: prev.instructors.includes(instructor._id)
                      ? prev.instructors.filter((id) => id !== instructor._id)
                      : [...prev.instructors, instructor._id],
                  }))
                }
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.email}</p>
                    <p className="text-sm text-gray-500">{instructor.phone}</p>
                  </div>
                  {formData.instructors.includes(instructor._id) ? (
                    <div className="bg-primary text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="border border-gray-200 p-1 rounded-full">
                      <Check className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {formData.instructors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Selected Instructors:
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.instructors.map((instructorId) => {
                  const instructor = instructors?.data?.find(
                    (i: any) => i._id === instructorId
                  );
                  return (
                    instructor && (
                      <div
                        key={instructorId}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{instructor.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData((prev) => ({
                              ...prev,
                              instructors: prev.instructors.filter(
                                (id) => id !== instructorId
                              ),
                            }));
                          }}
                          className="hover:text-primary/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {courseDetailsId ? "Updating..." : "Creating..."}
            </>
          ) : courseDetailsId ? (
            "Update Course Details"
          ) : (
            "Create Course Details"
          )}
        </Button>
      </form>
    </div>
  );
};

const CreateCourseDetailsPage = () => {
  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CourseDetailsForm />
      </Suspense>
    </div>
  );
};

export default CreateCourseDetailsPage;
