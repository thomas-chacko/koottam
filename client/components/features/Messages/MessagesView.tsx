'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Settings,
  Edit,
  Search,
  CheckCheck,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
  Send,
  BellOff,
  Info,
  UserX,
  X,
  Loader2,
} from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import Image from 'next/image';
import { useConversations, useConversationMessages } from '@/hooks/useMessages';
import { messageService, MessageParticipant } from '@/services/message.service';
import { socketService } from '@/services/socket.service';
import { useFollowActions } from '@/hooks/useFollow';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { UserProfile } from '@/services/user.service';

// ── helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z';
  const diff = Date.now() - new Date(normalized).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const getInitials = (name: string | null) =>
  (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

// ── Avatar helper ─────────────────────────────────────────────────────────────

function ParticipantAvatar({
  participant,
  size = 12,
  showOnline = false,
}: {
  participant: MessageParticipant;
  size?: number;
  showOnline?: boolean;
}) {
  const dim = `w-${size} h-${size}`;
  return (
    <div className="relative shrink-0">
      <div
        className={`${dim} rounded-full flex items-center justify-center font-bold overflow-hidden select-none bg-[#2a2a3e]`}
      >
        {participant.avatar_url ? (
          <Image
            src={participant.avatar_url}
            alt={participant.full_name || participant.username}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-white text-sm">
            {getInitials(participant.full_name || participant.username)}
          </span>
        )}
      </div>
      {showOnline && participant.is_online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-[#0a0a0f] rounded-full" />
      )}
    </div>
  );
}

// ── New Conversation Modal ────────────────────────────────────────────────────

function NewConvoModal({
  onClose,
  onConversationCreated,
}: {
  onClose: () => void;
  onConversationCreated: (convId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get<{ data: { users: UserProfile[] } }>('/user/search', {
          params: { q: query },
        });
        setResults(res.data.data.users || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (user: UserProfile) => {
    try {
      setCreating(true);
      const conv = await messageService.createConversation([user.id]);
      onConversationCreated(conv.id);
    } catch {
      // error handled by axios interceptor
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3e]">
          <h2 className="text-lg font-bold text-white">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#2a2a3e]">
          <div className="relative flex items-center bg-[#0a0a0f] border border-[#2a2a3e] rounded-full overflow-hidden focus-within:border-[#8B5CF6] transition-colors">
            <div className="pl-4 pr-3 text-[#9ca3af]">
              <Search className="w-4 h-4" />
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Search people"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-white placeholder-[#9ca3af] focus:outline-none text-[15px]"
            />
            {searching && <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin mr-4" />}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {results.length === 0 && query.trim() && !searching && (
            <p className="text-center text-[#9ca3af] py-8 text-sm">No users found</p>
          )}
          {!query.trim() && (
            <p className="text-center text-[#6b7280] py-8 text-sm">Search for someone to message</p>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#0a0a0f] transition-colors cursor-pointer border-b border-[#2a2a3e]/40 last:border-0 disabled:opacity-50"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2a2a3e] shrink-0">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(user.full_name || user.username)}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-semibold text-white text-[15px] truncate">
                  {user.full_name || user.username}
                </span>
                <span className="text-[#9ca3af] text-sm truncate">@{user.username}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Active Chat Panel ─────────────────────────────────────────────────────────

function ActiveChatPanel({
  activeChatId,
  onBack,
}: {
  activeChatId: string;
  onBack: () => void;
}) {
  const { user: authUser } = useAuthStore();
  const { messages, loading, sendMessage, sending } = useConversationMessages(activeChatId);
  const { conversations } = useConversations();
  const [inputText, setInputText] = useState('');
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeChatId);
  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== authUser?.id
  ) ?? null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Typing indicator listener
  useEffect(() => {
    socketService.connect();
    const off = socketService.onTyping((data) => {
      if (data.conversation_id !== activeChatId) return;
      if (data.user_id === authUser?.id) return;
      setTypingUserId(data.user_id);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUserId(null), 3000);
    });
    return () => {
      off?.();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [activeChatId, authUser?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socketService.emitTyping(activeChatId);
    }, 1000);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center justify-between w-full border-b border-[#2a2a3e] px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-white"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          {otherParticipant && (
            <div className="flex items-center gap-3 cursor-pointer">
              <ParticipantAvatar participant={otherParticipant} size={8} showOnline />
              <h1 className="text-base font-bold text-white tracking-tight leading-tight hover:underline">
                {otherParticipant.full_name || otherParticipant.username}
              </h1>
            </div>
          )}
        </div>
        <button className="p-2 rounded-full hover:bg-[#2a2a3e] text-[#ededed] transition-colors cursor-pointer">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Chat thread */}
      <div
        ref={scrollAreaRef}
        className="flex-1 w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Participant header card */}
        {otherParticipant && (
          <div className="flex flex-col items-center pb-6 border-b border-[#2a2a3e]/50 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2a2a3e] mb-3">
              {otherParticipant.avatar_url ? (
                <Image
                  src={otherParticipant.avatar_url}
                  alt={otherParticipant.full_name || otherParticipant.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(otherParticipant.full_name || otherParticipant.username)}
                </span>
              )}
            </div>
            <p className="font-bold text-white text-lg">
              {otherParticipant.full_name || otherParticipant.username}
            </p>
            <p className="text-[#9ca3af] text-sm">@{otherParticipant.username}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === authUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] ${
                  isMe
                    ? 'bg-[#8B5CF6] text-white rounded-tr-sm'
                    : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#ededed] rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[#6b7280] text-[11px] mt-1 px-1">{timeAgo(msg.created_at)}</span>
            </div>
          );
        })}

        {typingUserId && typingUserId !== authUser?.id && (
          <div className="flex items-start">
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl rounded-tl-sm px-4 py-2 text-[#9ca3af] text-sm italic">
              typing...
            </div>
          </div>
        )}

        <div className="h-4 w-full shrink-0" />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 z-20 bg-[#0a0a0f] p-3 border-t border-[#2a2a3e] w-full shrink-0">
        <div className="flex items-center bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden focus-within:border-[#8B5CF6] transition-colors">
          <button className="p-3 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 cursor-pointer transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Start a new message"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent py-3 px-2 text-white focus:outline-none text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-3 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main MessagesView ─────────────────────────────────────────────────────────

export function MessagesView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConvoModal, setShowNewConvoModal] = useState(false);

  const { user: authUser } = useAuthStore();
  const { conversations, loading: convsLoading, refetch } = useConversations();
  const { follow } = useFollowActions();

  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  const activeConversation = conversations.find((c) => c.id === activeChatId);
  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== authUser?.id
  ) ?? null;

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return conv.participants.some(
      (p) =>
        (p.full_name || '').toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
    );
  });

  const handleConversationCreated = useCallback(
    (convId: string) => {
      refetch();
      setActiveChatId(convId);
      setShowNewConvoModal(false);
    },
    [refetch]
  );

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

        {/* Main panel */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full border-r border-[#2a2a3e] flex flex-col">
            {!activeChatId ? (
              // INBOX LIST VIEW
              <>
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                      Messages
                    </h1>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer"
                        aria-label="Settings"
                      >
                        <Settings className="w-5 h-5 text-[#ededed]" />
                      </button>
                      <button
                        onClick={() => setShowNewConvoModal(true)}
                        className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer"
                        aria-label="New Message"
                      >
                        <Edit className="w-5 h-5 text-[#ededed]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-[#2a2a3e] shrink-0">
                  <div className="relative flex items-center bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden transition-all duration-300 rounded-full cursor-text group focus-within:border-[#8B5CF6]">
                    <div className="pl-4 pr-3 py-2.5 text-[#9ca3af] group-focus-within:text-[#8B5CF6] transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Direct Messages"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-[#9ca3af] focus:outline-none text-[15px]"
                    />
                  </div>
                </div>

                {/* Conversations list */}
                <div className="w-full flex-1 pb-12">
                  {convsLoading && (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                    </div>
                  )}
                  {!convsLoading && filteredConversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                      <MessageSquare className="w-10 h-10 text-[#8B5CF6] mb-3 opacity-50" />
                      <p className="text-[#9ca3af]">No conversations yet</p>
                    </div>
                  )}
                  {filteredConversations.map((conv) => {
                    const other = conv.participants.find((p) => p.id !== authUser?.id);
                    if (!other) return null;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveChatId(conv.id)}
                        className="w-full px-4 py-4 flex items-start gap-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer border-b border-[#2a2a3e]/50 group"
                      >
                        <ParticipantAvatar participant={other} size={12} showOnline />

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-bold text-[15px] text-white truncate group-hover:underline cursor-pointer">
                                {other.full_name || other.username}
                              </span>
                              <span className="text-[#9ca3af] text-[15px] truncate">
                                @{other.username}
                              </span>
                            </div>
                            <span className="text-[#9ca3af] text-xs shrink-0 ml-2">
                              {conv.updated_at ? timeAgo(conv.updated_at) : ''}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              {conv.unread_count === 0 ? (
                                <CheckCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
                              )}
                              <p
                                className={`text-[15px] truncate ${
                                  conv.unread_count > 0 ? 'text-white font-medium' : 'text-[#9ca3af]'
                                }`}
                              >
                                {conv.last_message?.content ?? ''}
                              </p>
                            </div>
                            {conv.unread_count > 0 && (
                              <span className="shrink-0 ml-2 w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold flex items-center justify-center">
                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // ACTIVE CHAT VIEW
              <ActiveChatPanel
                activeChatId={activeChatId}
                onBack={() => setActiveChatId(null)}
              />
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          ref={rightSidebarRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          {!activeChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="w-20 h-20 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-2">
                <MessageSquare className="w-10 h-10 text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Select a message</h2>
                <p className="text-[#9ca3af] text-[15px] leading-relaxed">
                  Choose from your existing conversations, start a new one, or just keep swimming.
                </p>
              </div>
              <button
                onClick={() => setShowNewConvoModal(true)}
                className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-full transition-colors cursor-pointer w-full text-[15px]"
              >
                New message
              </button>
            </div>
          ) : otherParticipant ? (
            <div className="h-full py-6 space-y-6 pb-20">
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2a2a3e] mb-4 border-2 border-[#2a2a3e]">
                  {otherParticipant.avatar_url ? (
                    <Image
                      src={otherParticipant.avatar_url}
                      alt={otherParticipant.full_name || otherParticipant.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {getInitials(otherParticipant.full_name || otherParticipant.username)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {otherParticipant.full_name || otherParticipant.username}
                </h2>
                <p className="text-[#9ca3af] mb-4 font-medium">@{otherParticipant.username}</p>

                <div className="flex gap-4 w-full">
                  <button className="flex-1 py-1.5 border border-[#2a2a3e] rounded-full text-white text-sm font-semibold hover:bg-[#2a2a3e] transition-colors cursor-pointer">
                    Profile
                  </button>
                  <button
                    onClick={() => follow(otherParticipant.id)}
                    className="flex-1 py-1.5 bg-[#8B5CF6] rounded-full text-white text-sm font-semibold hover:bg-[#7c3aed] transition-colors cursor-pointer"
                  >
                    Follow
                  </button>
                </div>
              </div>

              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl shadow-sm overflow-hidden">
                <button className="w-full px-5 py-4 flex items-center justify-between text-white hover:bg-[#2a2a3e] transition-colors cursor-pointer border-b border-[#2a2a3e]">
                  <span className="font-semibold text-[15px]">Snooze notifications</span>
                  <BellOff className="w-5 h-5 text-[#9ca3af]" />
                </button>
                <button className="w-full px-5 py-4 flex items-center justify-between text-white hover:bg-[#2a2a3e] transition-colors cursor-pointer border-b border-[#2a2a3e]">
                  <span className="font-semibold text-[15px]">Report message</span>
                  <Info className="w-5 h-5 text-[#9ca3af]" />
                </button>
                <button className="w-full px-5 py-4 flex items-center justify-between text-red-500 hover:bg-[#2a2a3e] transition-colors cursor-pointer">
                  <span className="font-semibold text-[15px]">Block user</span>
                  <UserX className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {showNewConvoModal && (
        <NewConvoModal
          onClose={() => setShowNewConvoModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
