"use client";

import { UserX } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

export function ProfileNotFound() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full flex-1 px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Feed Content */}
        <main className="flex-1 w-full max-w-[650px] mx-auto h-full flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center text-center max-w-md bg-[#1a1a2e]/50 border border-[#2a2a3e] p-8 rounded-2xl backdrop-blur-sm">
            <div className="w-20 h-20 bg-[#2a2a3e] rounded-full flex items-center justify-center mb-6">
              <UserX className="w-10 h-10 text-[#9ca3af]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Profile Not Found</h2>
            <p className="text-[#9ca3af] mb-8 leading-relaxed">
              The user you're looking for doesn't exist, has been removed, or you might have mistyped the username.
            </p>
            <Link 
              href="/"
              className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </main>

        {/* Right Sidebar Placeholder for Symmetry */}
        <aside className="hidden xl:block w-72 shrink-0 h-full" />
      </div>
    </div>
  );
}
