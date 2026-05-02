import { useState } from "react";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useDeleteAccount = () => {
  const [deleting, setDeleting] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  const deleteAccount = async () => {
    try {
      setDeleting(true);
      await userService.deleteAccount();

      toast.success("Account deleted successfully");
      logout();
      router.push("/login");
    } catch (error: any) {
      console.error("Delete account error:", error);
      const message =
        error.response?.data?.message || "Failed to delete account";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleteAccount,
    deleting,
  };
};
