import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios";

export interface Note {
  _id: string;
  title: string;
  description: string;
  createdBy: string | null;
  moduleId: {
    _id: string;
    moduleTitle: string;
    slug: string;
  };
  courseId: string | null;
  noteFile: string;
  status: "Draft" | "Published";
  scheduleDate: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
}

const fetchNotes = async (moduleId: string) => {
  const response = await axiosInstance.get(`/note/${moduleId}`);
  return response.data;
};

export const useNoteList = (moduleId: string) => {
  return useQuery({
    queryKey: ["notes", moduleId],
    queryFn: () => fetchNotes(moduleId),
    enabled: !!moduleId,
  });
}; 