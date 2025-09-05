import axiosInstance from "../axios";
import { useMutation } from "@tanstack/react-query";

interface PdfUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  access_mode: string;
  original_filename: string;
  api_key: string;
}

/**
 * Uploads a PDF file to the server
 * @param file - The PDF file to upload
 * @returns A promise that resolves to the URL of the uploaded PDF
 */
async function uploadPdf(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await axiosInstance.post("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
}

/**
 * React Query mutation hook for uploading PDFs
 * @returns A mutation function that can be used to upload PDFs
 */
export function useUploadPdf() {
  return useMutation({
    mutationFn: (file: File) => uploadPdf(file),
  });
} 