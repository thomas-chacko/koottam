import api from "@/lib/axios";

export type UploadType = "avatar" | "cover" | "post" | "story" | "message";

interface UploadSignatureResponse {
  success: boolean;
  message: string;
  data: {
    signature: string;
    timestamp: number;
    folder: string;
  };
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export const mediaService = {
  // Get upload signature from backend
  getUploadSignature: async (type: UploadType) => {
    const response = await api.post<UploadSignatureResponse>(
      "/media/upload",
      { type }
    );
    return response.data.data;
  },

  // Upload file directly to Cloudinary
  uploadToCloudinary: async (
    file: File,
    signature: string,
    timestamp: number,
    folder: string
  ): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary configuration is missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  },
};
