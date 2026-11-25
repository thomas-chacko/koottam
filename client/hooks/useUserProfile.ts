import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/user.service";
import { toast } from "sonner";

export const useUserProfile = (username: string, enabled: boolean = true) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!enabled) return;
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
    if (username && enabled) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [username, enabled]);

  return { profile, loading, error, refetch: fetchProfile };
};
