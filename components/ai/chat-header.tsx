"use client";

import React from "react";
import { Menu } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  onOpenMobileSidebar: () => void;
  isSyncing: boolean;
}

export function ChatHeader({ onOpenMobileSidebar, isSyncing }: ChatHeaderProps) {
  return (
    <header className="h-16 border-b border-[#111] flex items-center justify-between px-6 z-20 backdrop-blur-2xl bg-[#000000]/70 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          className="rounded-xl border border-white/5 bg-white/5 p-2 text-white/40 md:hidden"
          onClick={onOpenMobileSidebar}
          type="button"
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 md:flex hidden">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-primary animate-pulse'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            {isSyncing ? 'Syncing with Database...' : 'Core Status: Stable'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-white/40 md:flex hidden">
          <span className="opacity-50">Session Active</span>
        </div>
        <div className="divider divider-horizontal mx-1 h-4 self-center opacity-10 md:flex hidden"></div>
        <Link className="btn btn-ghost btn-sm text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all" href="/">
          Disconnect
        </Link>
      </div>
    </header>
  );
}
