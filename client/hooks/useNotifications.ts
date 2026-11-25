import { useState, useEffect, useCallback } from "react";
import { Notification, notificationService } from "@/services/notification.service";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nData, cData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(nData.notifications);
      setUnreadCount(cData.count);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    notificationService.markRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    notificationService.markAllRead().catch(() => {});
  };

  const deleteNotification = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    notificationService.deleteNotification(id).catch(() => {});
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: fetchAll,
    markRead,
    markAllRead,
    deleteNotification,
  };
};
