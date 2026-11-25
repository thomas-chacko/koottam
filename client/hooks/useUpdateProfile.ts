import { useState } from "react";
import { userService, UpdateProfileData } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export const useUpdateProfile = () => {
  const [updating, setUpdating] = useState(false);
  const { user, setAuth, token } = useAuthStore();

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user || !token) {
      toast.error("You must be logged in");
      return null;
    }

    try {
      setUpdating(true);
      const updatedUser = await userService.updateProfile(data);

      // Update auth store with new user data
      setAuth(updatedUser, token);

      toast.success("Profile updated successfully");
      return updatedUser;
    } catch (error: any) {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateProfile,
    updating,
  };
};
