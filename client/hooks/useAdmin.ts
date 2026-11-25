import { useState, useEffect, useCallback } from "react";
import {
  AdminStats,
  AdminUser,
  adminService,
} from "@/services/admin.service";

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, total, loading, error, refetch: fetchUsers };
};

export const useAdminActions = () => {
  const [loading, setLoading] = useState(false);

  const verifyUser = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.verifyUser(id);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.suspendUser(id);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.activateUser(id);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.deletePost(id);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { verifyUser, suspendUser, activateUser, deletePost, loading };
};
