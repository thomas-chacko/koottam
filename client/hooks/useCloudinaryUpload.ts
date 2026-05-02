import { useState } from "react";
import { mediaService, UploadType } from "@/services/media.service";
import { toast } from "sonner";

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (
    file: File,
    type: UploadType
  ): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return null;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Step 1: Get signature from backend
      const { signature, timestamp, folder } =
        await mediaService.getUploadSignature(type);
      setProgress(30);

      // Step 2: Upload to Cloudinary
      const imageUrl = await mediaService.uploadToCloudinary(
        file,
        signature,
        timestamp,
        folder
      );
      setProgress(100);

      toast.success("Image uploaded successfully");
      return imageUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
  };
};
