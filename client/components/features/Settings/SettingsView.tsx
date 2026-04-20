'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
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
  Settings
} from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';

const SETTINGS_CATEGORIES = [
  { id: 'account', icon: User, title: 'Your Account', desc: 'See information about your account, download an archive of your data, or learn about your account deactivation options' },
  { id: 'security', icon: Lock, title: 'Security and account access', desc: 'Manage your account\'s security and keep track of your account\'s usage including apps that you have connected to your account.' },
  { id: 'monetization', icon: CreditCard, title: 'Premium & Monetization', desc: 'See how you can utilize Koottam Premium features and manage your options.' },
  { id: 'privacy', icon: Shield, title: 'Privacy and safety', desc: 'Manage what information you see and share on Koottam.' },
  { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Select the kinds of notifications you get about your activities, interests, and recommendations.' },
  { id: 'accessibility', icon: Eye, title: 'Accessibility, display, and languages', desc: 'Manage how Koottam content is displayed to you.' },
];

export function SettingsView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

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

        {/* Main Settings Content */}
        {/* Utilizing rule #6 Layout Symmetry: w-full max-w-[650px] without internal wrapper paddings */}
        <main ref={mainFeedRef} className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full min-h-full border-r border-[#2a2a3e] flex flex-col">
            
            {!activeMenu ? (
              // MASTER LIST: Settings Categories
              <>
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col w-full border-b border-[#2a2a3e]">
                  <div className="px-4 py-3 pb-4">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Settings</h1>
                    <p className="text-[#9ca3af] text-[13px] mt-1">@jrivera</p>
                  </div>
                </div>

                {/* Categories List */}
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
                            <span className="font-semibold text-[15px] text-white group-hover:underline">{category.title}</span>
                            <span className="text-[#6b7280] text-[13px] leading-relaxed">{category.desc}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6] transition-colors shrink-0" />
                      </button>
                    )
                  })}
                  
                  {/* Logout independent action */}
                  <div className="w-full h-[1px] bg-[#2a2a3e]/50 my-2" />
                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1f1624] transition-colors cursor-pointer group">
                    <div className="flex gap-4 items-start text-left text-red-500">
                      <LogOut className="w-5 h-5 shrink-0" />
                      <span className="font-semibold text-[15px]">Log out directly</span>
                    </div>
                  </button>
                </div>
              </>
            ) : activeMenu === 'account' ? (
              // INNER VIEW: Your Account Details
              <div className="flex flex-col h-full w-full">
                {/* Active Inner Header */}
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center w-full border-b border-[#2a2a3e] px-4 py-3 shrink-0">
                  <button 
                    onClick={() => setActiveMenu(null)} 
                    className="p-2 -ml-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-white mr-4"
                    aria-label="Back to settings"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Your Account</h1>
                  </div>
                </div>

                <div className="p-4 px-6 text-[#9ca3af] text-[15px] leading-relaxed border-b border-[#2a2a3e]/50 pb-6">
                  See information about your account, download an archive of your data, or learn about your account deactivation options
                </div>

                <div className="w-full flex flex-col">
                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group border-b border-[#2a2a3e]/30">
                    <div className="flex gap-4 items-start text-left">
                      <User className="w-5 h-5 text-[#9ca3af] shrink-0 mt-0.5 group-hover:text-white" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-white">Account Information</span>
                        <span className="text-[#6b7280] text-[13px]">See your account information like your phone number and email address.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6]" />
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group border-b border-[#2a2a3e]/30">
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
                        <span className="text-[#6b7280] text-[13px]">Get insights into the type of information stored for your account.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#8B5CF6]" />
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#1f1624] transition-colors cursor-pointer group border-b border-[#2a2a3e]/30">
                    <div className="flex gap-4 items-start text-left">
                      <UserMinus className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-[#ef4444]">Deactivate your account</span>
                        <span className="text-[#6b7280] text-[13px]">Find out how you can deactivate your account.</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#2a2a3e] group-hover:text-[#ef4444]" />
                  </button>
                </div>
              </div>
            ) : (
              // FALLBACK for other menus not yet fully built out
              <div className="flex flex-col h-full w-full">
                <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center w-full border-b border-[#2a2a3e] px-4 py-3 shrink-0">
                  <button 
                    onClick={() => setActiveMenu(null)} 
                    className="p-2 -ml-2 rounded-full hover:bg-[#2a2a3e] transition-colors cursor-pointer text-white mr-4"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-tight capitalize">{activeMenu} Settings</h1>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                   <Settings className="w-16 h-16 text-[#8B5CF6] mb-4 opacity-50" />
                   <h2 className="text-2xl font-bold text-white mb-2">Under Construction</h2>
                   <p className="text-[#9ca3af] max-w-sm">This specific settings pane is currently being integrated. Please check back later or review "Your Account".</p>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Right Sidebar - Descriptive Pane */}
        <aside ref={rightSidebarRef} className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4">
          <div className="py-6 space-y-6">
             <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5 shadow-sm text-center">
                <Smartphone className="w-8 h-8 text-[#8B5CF6] mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white mb-3">Koottam Application</h2>
                <p className="text-[#9ca3af] text-[13px] leading-relaxed mb-4">
                  Make sure you keep your Koottam experience updated. By managing your cache and preferences you ensure the most seamless connectivity.
                </p>
                <button className="w-full px-4 py-2 bg-[#2a2a3e] text-white font-bold rounded-full hover:bg-[#8B5CF6] transition-colors cursor-pointer">
                  Check for Updates
                </button>
             </section>

             {/* Dynamic Right Content purely visual symmetry */}
             {!activeMenu && (
                <div className="px-2 mt-8 text-[#6b7280] text-sm leading-relaxed">
                  These settings affect how your Koottam app behaves exclusively on your current device. To manage global settings, please modify your "Your Account" preferences directly.
                </div>
             )}
          </div>
        </aside>
      </div>
    </div>
  );
}
