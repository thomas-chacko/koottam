"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ChevronRight,
  User,
  Shield,
  Lock,
  CreditCard,
  Bell,
  Eye,
  LogOut,
  ArrowLeft,
  KeyRound,
  DownloadCloud,
  UserMinus,
  Smartphone,
  Settings,
  Loader2,
  UserX,
} from "lucide-react";
import { useLocalLenis } from "@/hooks/useLocalLenis";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import {
  settingsService,
  PrivacySettings,
  NotificationSettings,
  BlockedUser,
} from "@/services/settings.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Image from "next/image";

// ── Inline toggle ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
        checked ? "bg-[#8B5CF6]" : "bg-[#2a2a3e]"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Three-button selector ─────────────────────────────────────────────────────

function ThreeSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            value === opt
              ? "bg-[#8B5CF6] text-white"
              : "text-[#9ca3af] hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Back header ───────────────────────────────────────────────────────────────

function BackHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center w-full border-b border-[#2a2a3e] px-4 py-3 shrink-0">
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-white mr-4"
        aria-label="Back to settings"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
        {title}
      </h1>
    </div>
  );
}

// ── Settings categories ───────────────────────────────────────────────────────

const SETTINGS_CATEGORIES = [
  {
    id: "account",
    icon: User,
    title: "Your Account",
    desc: "See information about your account, download an archive of your data, or learn about your account deactivation options",
  },
  {
    id: "security",
    icon: Lock,
    title: "Security and account access",
    desc: "Manage your account's security and keep track of your account's usage including apps that you have connected to your account.",
  },
  {
    id: "monetization",
    icon: CreditCard,
    title: "Premium & Monetization",
    desc: "See how you can utilize Koottam Premium features and manage your options.",
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Privacy and safety",
    desc: "Manage what information you see and share on Koottam.",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    desc: "Manage which notifications you receive.",
  },
  {
    id: "blocked",
    icon: UserX,
    title: "Blocked Accounts",
    desc: "Manage accounts you have blocked.",
  },
];

// ── Pane: Change Password ─────────────────────────────────────────────────────

function ChangePasswordPane({ onBack }: { onBack: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // axios interceptor shows toast; nothing else to do
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <BackHeader title="Change Password" onBack={onBack} />
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#9ca3af]">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#9ca3af]">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#9ca3af]">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Password
        </button>
      </form>
    </div>
  );
}

// ── Pane: Privacy ─────────────────────────────────────────────────────────────

const MENTION_OPTIONS = ["Everyone", "People you follow", "Nobody"];
const DM_OPTIONS = ["Everyone", "People you follow", "Nobody"];

function PrivacyPane({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getPrivacySettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePrivate = async () => {
    if (!settings) return;
    const updated = { ...settings, is_private: !settings.is_private };
    setSettings(updated);
    try {
      await settingsService.updatePrivacySettings({ is_private: updated.is_private });
      toast.success("Privacy updated");
    } catch {
      setSettings(settings);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await settingsService.updatePrivacySettings(settings);
      toast.success("Privacy settings saved");
    } catch {
      // error handled by axios interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <BackHeader title="Privacy and Safety" onBack={onBack} />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
        </div>
      ) : settings ? (
        <div className="p-6 flex flex-col gap-6 max-w-md">
          {/* Private account */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-[15px]">Private Account</p>
              <p className="text-[#6b7280] text-sm mt-0.5">Only approved followers can see your posts</p>
            </div>
            <Toggle checked={settings.is_private} onChange={handleTogglePrivate} />
          </div>

          <div className="w-full h-px bg-[#2a2a3e]" />

          {/* Allow mentions */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-white text-[15px]">Allow Mentions</p>
              <p className="text-[#6b7280] text-sm mt-0.5">Who can mention you in posts</p>
            </div>
            <ThreeSelector
              options={MENTION_OPTIONS}
              value={settings.allow_mentions}
              onChange={(v) => setSettings({ ...settings, allow_mentions: v })}
            />
          </div>

          <div className="w-full h-px bg-[#2a2a3e]" />

          {/* Allow DMs */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-white text-[15px]">Allow Direct Messages</p>
              <p className="text-[#6b7280] text-sm mt-0.5">Who can send you direct messages</p>
            </div>
            <ThreeSelector
              options={DM_OPTIONS}
              value={settings.allow_dms}
              onChange={(v) => setSettings({ ...settings, allow_dms: v })}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      ) : (
        <p className="text-[#9ca3af] p-6">Failed to load privacy settings.</p>
      )}
    </div>
  );
}

// ── Pane: Notifications ───────────────────────────────────────────────────────

type NotifKey = keyof NotificationSettings;

const NOTIF_ROWS: { key: NotifKey; label: string; desc: string }[] = [
  { key: "likes", label: "Likes", desc: "When someone likes your post" },
  { key: "comments", label: "Comments", desc: "When someone comments on your post" },
  { key: "follows", label: "Follows", desc: "When someone follows you" },
  { key: "mentions", label: "Mentions", desc: "When someone mentions you" },
  { key: "messages", label: "Messages", desc: "When you receive a direct message" },
];

function NotificationsPane({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService
      .getNotificationSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: NotifKey, value: boolean) => {
    if (!settings) return;
    const prev = { ...settings };
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await settingsService.updateNotificationSettings({ [key]: value });
      toast.success("Notification preference updated");
    } catch {
      setSettings(prev);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <BackHeader title="Notifications" onBack={onBack} />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
        </div>
      ) : settings ? (
        <div className="flex flex-col">
          {NOTIF_ROWS.map((row, i) => (
            <div
              key={row.key}
              className={`flex items-center justify-between px-6 py-4 ${
                i < NOTIF_ROWS.length - 1 ? "border-b border-[#2a2a3e]/50" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-white text-[15px]">{row.label}</p>
                <p className="text-[#6b7280] text-sm mt-0.5">{row.desc}</p>
              </div>
              <Toggle
                checked={settings[row.key]}
                onChange={(v) => handleToggle(row.key, v)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#9ca3af] p-6">Failed to load notification settings.</p>
      )}
    </div>
  );
}

// ── Pane: Blocked Accounts ────────────────────────────────────────────────────

function BlockedPane({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    settingsService
      .getBlockedUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (userId: string) => {
    try {
      setUnblocking(userId);
      await settingsService.unblockUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User unblocked");
    } catch {
      // error handled by axios interceptor
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <BackHeader title="Blocked Accounts" onBack={onBack} />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <UserX className="w-10 h-10 text-[#8B5CF6] mb-3 opacity-50" />
          <p className="text-[#9ca3af]">No blocked accounts</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3e]/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2a2a3e] shrink-0">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt={u.username} fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {(u.full_name || u.username)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white text-[15px] truncate">
                    {u.full_name || u.username}
                  </span>
                  <span className="text-[#9ca3af] text-sm truncate">@{u.username}</span>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(u.id)}
                disabled={unblocking === u.id}
                className="ml-4 shrink-0 px-4 py-1.5 border border-[#2a2a3e] rounded-full text-white text-sm font-semibold hover:bg-[#2a2a3e] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {unblocking === u.id && <Loader2 className="w-3 h-3 animate-spin" />}
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main SettingsView ─────────────────────────────────────────────────────────

export function SettingsView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user: authUser, logout: clearAuthStore } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuthStore();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!deactivatePassword) {
      toast.error("Please enter your password");
      return;
    }
    try {
      setIsDeactivating(true);
      await userService.deleteAccount(deactivatePassword);
      clearAuthStore();
      toast.success("Account deactivated successfully");
      router.push("/signup");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
    }
  };

  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const renderActivePane = () => {
    if (activeMenu === "account") {
      return (
        <div className="flex flex-col h-full w-full">
          <BackHeader title="Your Account" onBack={() => setActiveMenu(null)} />
          <div className="p-4 px-6 text-[#9ca3af] text-[15px] leading-relaxed border-b border-[#2a2a3e]/50 pb-6">
            See information about your account, download an archive of your
            data, or learn about your account deactivation options
          </div>
          <div className="w-full flex flex-col">
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group border-b border-[#2a2a3e]/30">
              <div className="flex gap-4 items-start text-left">
                <User className="w-5 h-5 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-white" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-white">Account Information</span>
                  <span className="text-[#6b7280] text-[13px]">
                    See your account information like your phone number and email address.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6]" />
            </button>

            <button
              onClick={() => setActiveMenu("change-password")}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group border-b border-[#2a2a3e]/30"
            >
              <div className="flex gap-4 items-start text-left">
                <KeyRound className="w-5 h-5 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-white" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-white">Change your password</span>
                  <span className="text-[#6b7280] text-[13px]">Change your password at any time.</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6]" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group border-b border-[#2a2a3e]/30">
              <div className="flex gap-4 items-start text-left">
                <DownloadCloud className="w-5 h-5 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-white" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-white">Download an archive of your data</span>
                  <span className="text-[#6b7280] text-[13px]">
                    Get insights into the type of information stored for your account.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6]" />
            </button>

            <button
              onClick={() => setShowDeactivateModal(true)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1f1624] transition-colors cursor-pointer group border-b border-[#2a2a3e]/30"
            >
              <div className="flex gap-4 items-start text-left">
                <UserMinus className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-[#ef4444]">Deactivate your account</span>
                  <span className="text-[#6b7280] text-[13px]">
                    Find out how you can deactivate your account.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#ef4444]" />
            </button>
          </div>
        </div>
      );
    }

    if (activeMenu === "change-password") {
      return <ChangePasswordPane onBack={() => setActiveMenu("account")} />;
    }

    if (activeMenu === "privacy") {
      return <PrivacyPane onBack={() => setActiveMenu(null)} />;
    }

    if (activeMenu === "notifications") {
      return <NotificationsPane onBack={() => setActiveMenu(null)} />;
    }

    if (activeMenu === "blocked") {
      return <BlockedPane onBack={() => setActiveMenu(null)} />;
    }

    // Generic placeholder for unbuilt panes (security, monetization)
    return (
      <div className="flex flex-col h-full w-full">
        <BackHeader title={`${activeMenu} Settings`} onBack={() => setActiveMenu(null)} />
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
          <Settings className="w-16 h-16 text-[#8B5CF6] mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">Under Construction</h2>
          <p className="text-[#9ca3af] max-w-sm">
            This specific settings pane is currently being integrated. Please check back later or
            review "Your Account".
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Settings Content */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full border-r border-[#2a2a3e] flex flex-col">
            {!activeMenu ? (
              <>
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
                  <div className="px-4 py-3 pb-4">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Settings</h1>
                    <p className="text-[#9ca3af] text-[13px] mt-1">@{authUser?.username}</p>
                  </div>
                </div>

                <div className="w-full flex flex-col">
                  {SETTINGS_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveMenu(category.id)}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-4 items-start text-left max-w-[85%]">
                          <Icon className="w-5 h-5 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-[15px] text-white group-hover:underline">
                              {category.title}
                            </span>
                            <span className="text-[#6b7280] text-[13px] leading-relaxed">
                              {category.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6] transition-colors shrink-0" />
                      </button>
                    );
                  })}

                  <div className="w-full h-[1px] bg-[#2a2a3e]/50 my-2" />
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1f1624] transition-colors cursor-pointer group"
                  >
                    <div className="flex gap-4 items-start text-left text-red-500">
                      <LogOut className="w-5 h-5 shrink-0" />
                      <span className="font-semibold text-[15px]">Log out</span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              renderActivePane()
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          ref={rightSidebarRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          <div className="py-6 space-y-6">
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm text-center">
              <Smartphone className="w-8 h-8 text-[#8B5CF6] mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white mb-3">Koottam Application</h2>
              <p className="text-[#9ca3af] text-[13px] leading-relaxed mb-4">
                Make sure you keep your Koottam experience updated. By managing your cache and
                preferences you ensure the most seamless connectivity.
              </p>
              <button className="w-full px-4 py-2 bg-[#2a2a3e] text-white font-bold rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer">
                Check for Updates
              </button>
            </section>
            {!activeMenu && (
              <div className="px-2 mt-8 text-[#6b7280] text-sm leading-relaxed">
                These settings affect how your Koottam app behaves exclusively on your current
                device. To manage global settings, please modify your "Your Account" preferences
                directly.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Log out of Koottam?</h2>
            <p className="text-[#9ca3af] text-sm mb-6">
              You can always log back in at any time. Are you sure you want to log out now?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                Log out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 bg-[#2a2a3e] text-white font-semibold rounded-lg hover:bg-[#3a3a4e] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden flex flex-col p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
              <UserMinus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Deactivate Account</h2>
            <p className="text-[#9ca3af] text-sm mb-4 leading-relaxed">
              Are you sure you want to delete your Koottam account?
              <br />
              <span className="text-red-400 font-semibold">
                You will permanently lose all your progress, posts, followers, and bookmarks. This
                action cannot be undone.
              </span>
            </p>
            <div className="text-left mb-6 mt-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To continue, enter your password:
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating || !deactivatePassword}
                className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
              >
                {isDeactivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deactivating...
                  </>
                ) : (
                  "Permanently delete my account"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivatePassword("");
                }}
                disabled={isDeactivating}
                className="w-full py-2.5 bg-[#2a2a3e] text-white font-semibold rounded-lg hover:bg-[#3a3a4e] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
