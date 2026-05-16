"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useAI } from "./ai-provider";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ icon, title, subtitle, children, actions }: PageHeaderProps) {
  const { setMobileSidebarOpen } = useAI();

  return (
    <header className="w-full h-16 shrink-0 border-b border-white/5 bg-black/70 backdrop-blur-xl z-30 sticky top-0">
      <div className="mx-auto max-w-8xl px-5 h-full">
        <div className="flex items-center justify-between gap-4 h-full">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden size-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={16} />
            </button>

            <div className="size-9 rounded-xl bg-white/4 border border-white/10 flex items-center justify-center shrink-0">
              {React.cloneElement(icon as React.ReactElement, { className: "size-4 text-indigo-200" })}
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-medium tracking-tight text-white truncate">{title}</h1>
              <p className="text-xs text-white/35 truncate">{subtitle}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 justify-center max-w-xl mx-4">
            {children}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}
