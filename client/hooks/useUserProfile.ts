import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/user.service";
import { toast } from "sonner";

export const useUserProfile = (username: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile(username);
      setProfile(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  return { profile, loading, error, refetch: fetchProfile };
};
