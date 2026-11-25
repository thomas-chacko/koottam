import api from "@/lib/axios";
import { UserProfile } from "@/services/user.service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminUser extends UserProfile {
  status: string;
  suspended_at?: string;
}

export interface AdminStats {
  total_users: number;
  total_posts: number;
  reports_pending: number;
  active_today: number;
}

export interface AdminReport {
  id: string;
  reporter_id: string;
  type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const adminService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: AdminUser[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ users: AdminUser[]; total: number }>
    >("/admin/users", { params });
    return response.data.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return response.data.data;
  },

  verifyUser: async (id: string): Promise<void> => {
    await api.put(`/admin/user/${id}/verify`);
  },

  suspendUser: async (id: string): Promise<void> => {
    await api.put(`/admin/user/${id}/suspend`);
  },

  activateUser: async (id: string): Promise<void> => {
    await api.put(`/admin/user/${id}/activate`);
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/admin/post/${id}`);
  },

  getReports: async (
    params?: Record<string, unknown>
  ): Promise<{ reports: AdminReport[]; total: number }> => {
    const response = await api.get<
      ApiResponse<{ reports: AdminReport[]; total: number }>
    >("/admin/reports", { params });
    return response.data.data;
  },

  reviewReport: async (id: string): Promise<void> => {
    await api.put(`/admin/report/${id}/review`);
  },

  dismissReport: async (id: string): Promise<void> => {
    await api.put(`/admin/report/${id}/dismiss`);
  },
};
