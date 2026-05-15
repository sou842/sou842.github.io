"use client";

import React from "react";
import { BookOpenCheck, Check, Menu } from "lucide-react";
import Link from "next/link";
import { useAI } from "../_components/ai-provider";

export default function TasksPage() {
  const { setMobileSidebarOpen } = useAI();

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden size-12 rounded-xl border border-white/10 bg-white flex items-center justify-center"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={16} />
              </button>

              <div className="size-9 rounded-xl bg-white/4 border border-white/10 flex items-center justify-center">
                <BookOpenCheck className="size-4 text-indigo-200" />
              </div>

              <div>
                <h1 className="text-base font-medium tracking-tight">Tasks</h1>
                <p className="text-xs text-white/35">Manage your upcoming tasks</p>
              </div>
            </div>

            <Link
              href="/ai"
              className="h-9 px-5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition flex items-center"
            >
              Back to Chat
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-12 relative z-10">
        {/* content */}
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none overflow-hidden h-[115vh] flex items-end">
        {/* <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" /> */}
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2810%29-UnDKstODkIENp5xqTYUEpt0Sm8tNOw.png" 
          alt="Decorative Background" 
          className="w-full h-auto object-cover object-bottom opacity-90 mix-blend-lighten scale-110"
        />
      </div>
    </>
  );
}
