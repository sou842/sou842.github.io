"use client";

import React from "react";
import { Layers, Menu } from "lucide-react";
import { useAI } from "../_components/ai-provider";

export default function IntegrationsPage() {
  const { setMobileSidebarOpen } = useAI();

  return (
    <>
      <header className="w-full h-16 sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto max-w-8xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden size-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={16} />
              </button>

              <div className="size-9 rounded-xl bg-white/4 border border-white/10 flex items-center justify-center">
                <Layers className="size-4 text-indigo-200" />
              </div>

              <div>
                <h1 className="text-base font-medium tracking-tight text-white">Integrations</h1>
                <p className="text-xs text-white/35">Connect your favorite tools with Jarvis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-8xl px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* GitHub Integration Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-[#24292f] flex items-center justify-center border border-white/10">
                <svg className="size-6 text-white" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                Connected
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">GitHub</h3>
              <p className="text-sm text-white/40 mt-1">
                Jarvis can now access your repositories, read code, and search projects.
              </p>
            </div>
            <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/20 italic">Using Personal Access Token</span>
              <button className="text-xs text-white/40 hover:text-white transition-colors">Manage</button>
            </div>
          </div>

          {/* Placeholder for future integrations */}
          <div className="p-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Layers className="size-5 text-white/20" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/40">More coming soon</h3>
              <p className="text-xs text-white/20 mt-1">Google Calendar, Slack, and more.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
