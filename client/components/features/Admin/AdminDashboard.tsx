'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  LogOut,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  adminService,
  AdminStats,
  AdminUser,
  AdminReport,
} from '@/services/admin.service';
import { Post } from '@/services/post.service';
import api from '@/lib/axios';
import { authService } from '@/services/auth.service';

type View = 'dashboard' | 'users' | 'posts' | 'reports';

const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  posts: 'Posts',
  reports: 'Reports',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5'>
      <div className={`inline-flex p-2 rounded-lg ${color}`}>{icon}</div>
      <p className='text-3xl font-bold text-white mt-2'>
        {value !== undefined ? value.toLocaleString() : '—'}
      </p>
      <p className='text-[#9ca3af] text-sm font-medium mt-1'>{label}</p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 animate-pulse h-28' />
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role?: string }) {
  if (role === 'admin')
    return (
      <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400'>
        admin
      </span>
    );
  if (role === 'moderator')
    return (
      <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400'>
        moderator
      </span>
    );
  return (
    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2a2a3e] text-[#9ca3af]'>
      user
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'suspended')
    return (
      <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400'>
        suspended
      </span>
    );
  return (
    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400'>
      active
    </span>
  );
}

function ReportStatusBadge({ status }: { status: string }) {
  if (status === 'reviewed')
    return (
      <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400'>
        reviewed
      </span>
    );
  if (status === 'dismissed')
    return (
      <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2a2a3e] text-[#9ca3af]'>
        dismissed
      </span>
    );
  return (
    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400'>
      pending
    </span>
  );
}

// ─── User Actions Dropdown ────────────────────────────────────────────────────

function UserActionsDropdown({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = async (action: () => Promise<void>) => {
    setOpen(false);
    try {
      await action();
    } catch {
      // errors handled by axios interceptor
    }
  };

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen((v) => !v)}
        className='flex items-center gap-1 px-3 py-1.5 bg-[#2a2a3e] hover:bg-[#3a3a5e] text-white text-sm rounded-lg transition-colors'
      >
        Actions <ChevronDown size={14} />
      </button>
      {open && (
        <div className='absolute right-0 mt-1 w-36 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl z-10 overflow-hidden'>
          <button
            onClick={() => handle(() => adminService.verifyUser(user.id))}
            className='w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-[#2a2a3e] transition-colors'
          >
            Verify
          </button>
          <button
            onClick={() => handle(() => adminService.suspendUser(user.id))}
            className='w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a3e] transition-colors'
          >
            Suspend
          </button>
          <button
            onClick={() => handle(() => adminService.activateUser(user.id))}
            className='w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-[#2a2a3e] transition-colors'
          >
            Activate
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [view, setView] = useState<View>('dashboard');

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Reports state
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Role guard
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      !['admin', 'moderator'].includes(user.role ?? '')
    ) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch data when view changes
  useEffect(() => {
    if (view === 'dashboard' && !stats) {
      setStatsLoading(true);
      adminService
        .getStats()
        .then(setStats)
        .finally(() => setStatsLoading(false));
    }
    if (view === 'users' && users.length === 0) {
      setUsersLoading(true);
      adminService
        .getUsers({ page: 1, limit: 20 })
        .then((res) => setUsers(res.users))
        .finally(() => setUsersLoading(false));
    }
    if (view === 'posts' && posts.length === 0) {
      setPostsLoading(true);
      api
        .get<{ success: boolean; message: string; data: { posts: Post[]; total: number } }>('/feed/home', {
          params: { limit: 20 },
        })
        .then((res) => setPosts(res.data.data.posts))
        .catch(() => setPosts([]))
        .finally(() => setPostsLoading(false));
    }
    if (view === 'reports' && reports.length === 0) {
      setReportsLoading(true);
      adminService
        .getReports({ limit: 20 })
        .then((res) => setReports(res.reports))
        .finally(() => setReportsLoading(false));
    }
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/admin/login');
  };

  const navItems: { label: string; icon: React.ReactNode; v: View }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, v: 'dashboard' },
    { label: 'Users', icon: <Users size={18} />, v: 'users' },
    { label: 'Posts', icon: <FileText size={18} />, v: 'posts' },
    { label: 'Reports', icon: <Flag size={18} />, v: 'reports' },
  ];

  return (
    <div className='min-h-screen bg-[#0a0a0f] flex'>
      {/* Sidebar */}
      <aside className='w-64 bg-[#0d0d14] border-r border-[#2a2a3e] flex flex-col h-screen sticky top-0'>
        <div className='p-6 border-b border-[#2a2a3e]'>
          <h1 className='text-xl font-bold text-white'>
            <span className='text-[#8B5CF6]'>K</span>oottam{' '}
            <span className='text-[#9ca3af] text-sm font-normal'>Admin</span>
          </h1>
        </div>

        <nav className='flex-1 py-2'>
          {navItems.map(({ label, icon, v }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-0.5 cursor-pointer transition-colors font-medium text-[15px] w-[calc(100%-16px)] text-left ${
                view === v
                  ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                  : 'text-[#9ca3af] hover:bg-[#1a1a2e] hover:text-white'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className='flex items-center gap-3 px-4 py-3 mx-2 mb-4 rounded-lg text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors font-medium text-[15px]'
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className='flex-1 overflow-y-auto'>
        {/* Page header */}
        <div className='flex items-center justify-between p-6 border-b border-[#2a2a3e]'>
          <h2 className='text-2xl font-bold text-white'>
            {VIEW_TITLES[view]}
          </h2>
        </div>

        <div className='p-6'>
          {/* Dashboard view */}
          {view === 'dashboard' && (
            <div className='grid grid-cols-2 xl:grid-cols-4 gap-4'>
              {statsLoading ? (
                <>
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    label='Total Users'
                    value={stats?.total_users}
                    icon={<Users size={20} className='text-blue-400' />}
                    color='bg-blue-500/10'
                  />
                  <StatCard
                    label='Total Posts'
                    value={stats?.total_posts}
                    icon={<FileText size={20} className='text-[#8B5CF6]' />}
                    color='bg-[#8B5CF6]/10'
                  />
                  <StatCard
                    label='Pending Reports'
                    value={stats?.reports_pending}
                    icon={<Flag size={20} className='text-yellow-400' />}
                    color='bg-yellow-500/10'
                  />
                  <StatCard
                    label='Active Today'
                    value={stats?.active_today}
                    icon={<Users size={20} className='text-green-400' />}
                    color='bg-green-500/10'
                  />
                </>
              )}
            </div>
          )}

          {/* Users view */}
          {view === 'users' && (
            <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl overflow-hidden'>
              {usersLoading ? (
                <div className='p-4 space-y-2'>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className='h-14 bg-[#0a0a0f] animate-pulse rounded'
                    />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-[#9ca3af]'>
                  <Users size={48} className='mb-3 opacity-30' />
                  <p>No users found</p>
                </div>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-[#2a2a3e]'>
                      {['Name', 'Username', 'Role', 'Status', 'Actions'].map(
                        (h) => (
                          <th
                            key={h}
                            className='text-[#9ca3af] text-sm font-semibold uppercase tracking-wider px-4 py-3 text-left bg-[#0d0d14]'
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className='border-b border-[#2a2a3e] hover:bg-[#0d0d14] transition-colors'
                      >
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            {u.avatar_url ? (
                              <Image
                                src={u.avatar_url}
                                alt={u.full_name ?? u.username}
                                width={32}
                                height={32}
                                className='rounded-full object-cover w-8 h-8'
                              />
                            ) : (
                              <div className='w-8 h-8 rounded-full bg-[#2a2a3e] flex items-center justify-center text-xs text-white font-semibold'>
                                {(u.full_name ?? u.username)[0].toUpperCase()}
                              </div>
                            )}
                            <span className='text-white text-sm font-medium'>
                              {u.full_name ?? u.username}
                            </span>
                          </div>
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm'>
                          @{u.username}
                        </td>
                        <td className='px-4 py-3'>
                          <RoleBadge role={u.role} />
                        </td>
                        <td className='px-4 py-3'>
                          <StatusBadge status={u.status} />
                        </td>
                        <td className='px-4 py-3'>
                          <UserActionsDropdown user={u} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Posts view */}
          {view === 'posts' && (
            <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl overflow-hidden'>
              {postsLoading ? (
                <div className='p-4 space-y-2'>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className='h-14 bg-[#0a0a0f] animate-pulse rounded'
                    />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-[#9ca3af]'>
                  <FileText size={48} className='mb-3 opacity-30' />
                  <p>No posts found</p>
                </div>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-[#2a2a3e]'>
                      {['Content', 'Author', 'Likes', 'Comments', 'Date', 'Delete'].map(
                        (h) => (
                          <th
                            key={h}
                            className='text-[#9ca3af] text-sm font-semibold uppercase tracking-wider px-4 py-3 text-left bg-[#0d0d14]'
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr
                        key={p.id}
                        className='border-b border-[#2a2a3e] hover:bg-[#0d0d14] transition-colors'
                      >
                        <td className='px-4 py-3 text-white text-sm max-w-xs'>
                          {p.content.length > 80
                            ? `${p.content.slice(0, 80)}…`
                            : p.content}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm'>
                          @{p.author.username}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm'>
                          {p.like_count}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm'>
                          {p.comment_count}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm whitespace-nowrap'>
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className='px-4 py-3'>
                          <button
                            onClick={async () => {
                              try {
                                await adminService.deletePost(p.id);
                                setPosts((prev) =>
                                  prev.filter((x) => x.id !== p.id)
                                );
                              } catch {
                                // handled by interceptor
                              }
                            }}
                            className='text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors'
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Reports view */}
          {view === 'reports' && (
            <div className='bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl overflow-hidden'>
              {reportsLoading ? (
                <div className='p-4 space-y-2'>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className='h-14 bg-[#0a0a0f] animate-pulse rounded'
                    />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-[#9ca3af]'>
                  <Flag size={48} className='mb-3 opacity-30' />
                  <p>No reports found</p>
                </div>
              ) : (
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-[#2a2a3e]'>
                      {['Reporter', 'Type', 'Reason', 'Status', 'Actions'].map(
                        (h) => (
                          <th
                            key={h}
                            className='text-[#9ca3af] text-sm font-semibold uppercase tracking-wider px-4 py-3 text-left bg-[#0d0d14]'
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        className='border-b border-[#2a2a3e] hover:bg-[#0d0d14] transition-colors'
                      >
                        <td className='px-4 py-3 text-white text-sm'>
                          @{r.reporter.username}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm capitalize'>
                          {r.type}
                        </td>
                        <td className='px-4 py-3 text-[#9ca3af] text-sm max-w-xs'>
                          {r.reason.length > 60
                            ? `${r.reason.slice(0, 60)}…`
                            : r.reason}
                        </td>
                        <td className='px-4 py-3'>
                          <ReportStatusBadge status={r.status} />
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={async () => {
                                try {
                                  await adminService.reviewReport(r.id);
                                  setReports((prev) =>
                                    prev.map((x) =>
                                      x.id === r.id
                                        ? { ...x, status: 'reviewed' }
                                        : x
                                    )
                                  );
                                } catch {
                                  // handled by interceptor
                                }
                              }}
                              disabled={r.status !== 'pending'}
                              className='px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                            >
                              Review
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await adminService.dismissReport(r.id);
                                  setReports((prev) =>
                                    prev.map((x) =>
                                      x.id === r.id
                                        ? { ...x, status: 'dismissed' }
                                        : x
                                    )
                                  );
                                } catch {
                                  // handled by interceptor
                                }
                              }}
                              disabled={r.status !== 'pending'}
                              className='px-3 py-1 text-xs bg-[#2a2a3e] text-[#9ca3af] hover:bg-[#3a3a5e] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
