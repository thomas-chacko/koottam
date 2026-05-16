import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/user.service";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export const useMyProfile = (enabled: boolean = true) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchProfile = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getMyProfile();
      setProfile(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load your profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && enabled) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, enabled]);

  return { profile, loading, error, refetch: fetchProfile };
};
