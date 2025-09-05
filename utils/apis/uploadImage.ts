import axiosInstance from "../axios";
import { useMutation } from "@tanstack/react-query";

/**
 * Uploads an image file to the server
 * @param file - The image file to upload
 * @returns A promise that resolves to the URL of the uploaded image
 */
async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data?.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * React Query mutation hook for uploading images
 * @returns A mutation function that can be used to upload images
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
} 