'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Settings, Edit, Search, CheckCheck, MessageSquare, ArrowLeft, Image as ImageIcon, Send, BellOff, Info, UserX } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import Image from 'next/image';

// Mapped mock data using only the existing images in /public/images/ to prevent broken UI
const MOCK_CONVERSATIONS = [
  { 
    id: '1', 
    name: 'Julian Rivera', 
    username: '@jrivera', 
    avatar: '/images/post-architecture.png', 
    lastMessage: 'The new structural layout for the feed is looking incredibly solid. Excellent job on maintaining the symmetry.', 
    time: '2m', 
    unread: 2,
    online: true,
    bio: 'Digital architect & UI engineer. Passionate about building minimal, meaningful experiences on the web.'
  },
  { 
    id: '2', 
    name: 'Elena Gilbert', 
    username: '@elenag', 
    avatar: '/images/post-ceramic.png', 
    lastMessage: 'Are we still on for the design review tomorrow morning?', 
    time: '1h', 
    unread: 0,
    online: false,
    bio: 'Product Designer at Koottam. Exploring the boundaries of human-computer interaction.'
  },
  { 
    id: '3', 
    name: 'Marcus Wright', 
    username: '@wright_tech', 
    avatar: '/images/koottam-logo.png', 
    lastMessage: 'I pushed the hotfix to the staging environment. Let me know when you get a chance.', 
    time: '4h', 
    unread: 0,
    online: true,
    bio: 'Fullstack developer. Open source enthusiast.'
  },
  { 
    id: '4', 
    name: 'Sophia Chen', 
    username: '@sophiachen', 
    avatar: '/images/post-architecture.png', 
    lastMessage: 'Sent an attachment', 
    time: '1d', 
    unread: 0,
    online: false,
    bio: 'Creative Director. Love taking photos in empty spatial warehouses.'
  },
  { 
    id: '5', 
    name: 'Alex Mercer', 
    username: '@amercer', 
    avatar: '/images/post-ceramic.png', 
    lastMessage: 'Haha yes exactly! That makes total sense.', 
    time: '2d', 
    unread: 0,
    online: false,
    bio: 'Just another developer passing through the matrix.'
  }
];

const MOCK_MESSAGES: Record<string, { id: string, sender: 'me' | 'them', text: string, time: string }[]> = {
  '1': [
    { id: 'm1', sender: 'them', text: 'Hey! Did you check out the new design system specs?', time: '10:30 PM' },
    { id: 'm2', sender: 'me', text: 'Yes, I just reviewed them. The color tokens look perfectly aligned with the mockups.', time: '10:35 PM' },
    { id: 'm3', sender: 'them', text: 'The new structural layout for the feed is looking incredibly solid. Excellent job on maintaining the symmetry.', time: '10:42 PM' },
  ],
  '2': [
    { id: 'm1', sender: 'them', text: 'Are we still on for the design review tomorrow morning?', time: 'Yesterday' }
  ],
  '3': [
    { id: 'm1', sender: 'them', text: 'I pushed the hotfix to the staging environment. Let me know when you get a chance.', time: '4h ago'}
  ]
};

export function MessagesView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  // Auto-scroll to bottom of chat when opening
  useEffect(() => {
    if (activeChatId && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [activeChatId]);

  const activeChat = MOCK_CONVERSATIONS.find(c => c.id === activeChatId);
  const activeMessages = activeChatId && MOCK_MESSAGES[activeChatId] ? MOCK_MESSAGES[activeChatId] : [];

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Inbox / Active Chat Content */}
        {/* Utilizing rule #6 Layout Symmetry: w-full max-w-[650px] without internal wrapper paddings */}
        <main ref={mainFeedRef} className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full min-h-full border-r border-[#2a2a3e] flex flex-col">
            
            {!activeChatId ? (
              // INBOX LIST VIEW
              <>
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Messages</h1>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group" aria-label="Settings">
                        <Settings className="w-5 h-5 text-[#ededed]" />
                      </button>
                      <button className="p-2 hover:bg-[#2a2a3e] rounded-full transition-colors cursor-pointer group" aria-label="New Message">
                        <Edit className="w-5 h-5 text-[#ededed]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Global Messages Search */}
                <div className="p-4 border-b border-[#2a2a3e] shrink-0">
                  <div className="relative flex items-center bg-[#1a1a2e] border border-[#2a2a3e] overflow-hidden transition-all duration-300 rounded-full cursor-text group focus-within:border-[#8B5CF6]">
                    <div className="pl-4 pr-3 py-2.5 text-[#9ca3af] group-focus-within:text-[#8B5CF6] transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Direct Messages"
                      className="w-full bg-transparent text-white placeholder-[#9ca3af] focus:outline-none text-[15px]"
                    />
                  </div>
                </div>

                {/* Inbox List */}
                <div className="w-full flex-1 pb-12">
                  {MOCK_CONVERSATIONS.map((chat) => (
                    <div 
                      key={chat.id} 
                      onClick={() => setActiveChatId(chat.id)}
                      className="w-full px-4 py-4 flex items-start gap-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer border-b border-[#2a2a3e]/50 group"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden select-none bg-[#2a2a3e]">
                          <Image 
                              src={chat.avatar} 
                              alt={chat.name} 
                              fill 
                              className="object-cover"
                            />
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-[#0a0a0f] rounded-full" />
                        )}
                      </div>

                      {/* Message Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-[15px] text-white truncate group-hover:underline cursor-pointer">{chat.name}</span>
                            <span className="text-[#9ca3af] text-[15px] truncate">{chat.username}</span>
                          </div>
                          <span className="text-[#9ca3af] text-xs shrink-0 ml-2">{chat.time}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {chat.unread === 0 ? (
                            <CheckCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
                          )}
                          <p className={`text-[15px] truncate ${chat.unread > 0 ? 'text-white font-medium' : 'text-[#9ca3af]'}`}>
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : activeChat ? (
              // ACTIVE CHAT VIEW
              <div className="flex flex-col h-full absolute inset-0">
                {/* Active Chat Header */}
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center justify-between w-full border-b border-[#2a2a3e] px-4 py-3 shrink-0">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setActiveChatId(null)} 
                      className="p-2 -ml-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-white"
                      aria-label="Back to inbox"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#2a2a3e]">
                        <Image src={activeChat.avatar} alt="Avatar" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <h1 className="text-base font-bold text-white tracking-tight leading-tight hover:underline">{activeChat.name}</h1>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-[#2a2a3e] text-[#ededed] transition-colors cursor-pointer">
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Scroll Thread */}
                <div ref={scrollAreaRef} className="flex-1 w-full overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex flex-col items-center pb-6 border-b border-[#2a2a3e]/50 mb-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2a2a3e] mb-3">
                       <Image src={activeChat.avatar} alt="Avatar" fill className="object-cover" />
                    </div>
                    <p className="font-bold text-white text-lg">{activeChat.name}</p>
                    <p className="text-[#9ca3af] text-sm">{activeChat.username}</p>
                    <p className="text-[#6b7280] text-xs mt-2">You joined this conversation on March 2024</p>
                  </div>

                  {activeMessages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] ${isMe ? 'bg-[#8B5CF6] text-white rounded-tr-sm' : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#ededed] rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[#6b7280] text-[11px] mt-1 px-1">{msg.time}</span>
                      </div>
                    )
                  })}
                  {/* Empty spacer purely to prevent input overlap */}
                  <div className="h-4 w-full shrink-0" />
                </div>

                {/* Bottom Input Area */}
                <div className="sticky bottom-0 z-20 bg-[#0a0a0f] p-3 border-t border-[#2a2a3e] w-full shrink-0">
                  <div className="flex items-center bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden focus-within:border-[#8B5CF6] transition-colors">
                    <button className="p-3 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 cursor-pointer transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Start a new message" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-transparent py-3 px-2 text-white focus:outline-none text-[15px]" 
                    />
                    <button 
                      className="p-3 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!inputText.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </main>

        {/* Right Sidebar - Dynamic Context */}
        <aside ref={rightSidebarRef} className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4">
          {!activeChatId ? (
            // Placeholder when no chat
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
              <button className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-full transition-colors cursor-pointer w-full text-[15px]">
                New message
              </button>
            </div>
          ) : activeChat ? (
            // Profile details of active chat participant
            <div className="h-full py-6 space-y-6 pb-20">
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2a2a3e] mb-4 border-2 border-[#2a2a3e]">
                  <Image src={activeChat.avatar} alt="Avatar" fill className="object-cover" />
                </div>
                <h2 className="text-xl font-bold text-white">{activeChat.name}</h2>
                <p className="text-[#9ca3af] mb-4 font-medium">{activeChat.username}</p>
                <p className="text-[#ededed] text-sm leading-relaxed mb-6">{activeChat.bio}</p>
                
                <div className="flex gap-4 w-full">
                  <button className="flex-1 py-1.5 border border-[#2a2a3e] rounded-full text-white text-sm font-semibold hover:bg-[#2a2a3e] transition-colors cursor-pointer">
                    Profile
                  </button>
                  <button className="flex-1 py-1.5 bg-[#8B5CF6] rounded-full text-white text-sm font-semibold hover:bg-[#7c3aed] transition-colors cursor-pointer">
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
    </div>
  );
}
