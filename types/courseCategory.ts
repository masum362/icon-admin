export interface CourseCategory {
  _id: string;
  title: string;
  cover_photo: string;
  createdBy: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
} 