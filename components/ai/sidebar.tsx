"use client";

import React from "react";
import { 
  Bot, 
  Brain, 
  Database, 
  FileText, 
  MessageCircle, 
  Palette, 
  PanelLeftClose, 
  PenTool, 
  Settings2, 
  SquarePlus,
  Trash2
} from "lucide-react";
import { StoredChat } from "@/app/ai/page";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarWidth: number;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  chats: StoredChat[];
  activeChatId: string;
  createNewChat: () => void;
  removeChat: (id: string) => void;
  onSelectChat: (id: string) => void;
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarWidth,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  chats,
  activeChatId,
  createNewChat,
  removeChat,
  onSelectChat,
}: SidebarProps) {
  const isCollapsed = !sidebarOpen;

  return (
    <>
      {mobileSidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#111] bg-[#000000] md:static md:z-10 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-all duration-300 ease-in-out`}
        style={{ width: isCollapsed ? 76 : sidebarWidth }}
      >
        {/* Header */}
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#111] h-16 shrink-0`}>
          {isCollapsed ? (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
            >
              <Bot size={20} />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">Jarvis AI</span>
                  <span className="text-xs text-white/40 font-medium truncate uppercase tracking-wider">Neural Shell</span>
                </div>
              </div>
              <button 
                className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all md:block hidden shrink-0"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-3 space-y-8 scrollbar-hide ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Workspace Section */}
          <div className={`space-y-1 ${isCollapsed ? 'w-full flex flex-col items-center' : 'w-full'}`}>
            {!isCollapsed && <div className="px-3 py-2 text-xs font-medium text-white/20">Workspace</div>}
            <button
              onClick={createNewChat}
              className={`flex items-center transition-all group ${
                isCollapsed 
                  ? "w-10 h-10 justify-center rounded-xl bg-white/5 hover:bg-white/10" 
                  : "w-full gap-3 px-3 py-2.5 rounded-xl bg-white/5 text-white font-medium text-sm hover:bg-white/10"
              }`}
            >
              <SquarePlus size={18} className="text-white/40 group-hover:text-white transition-colors shrink-0" />
              {!isCollapsed && <span>New Chat</span>}
            </button>
            <SidebarNavItem icon={<Brain size={18} />} label="Memory" isCollapsed={isCollapsed} />
            <SidebarNavItem icon={<Database size={18} />} label="Knowledge" isCollapsed={isCollapsed} />
            <SidebarNavItem icon={<Settings2 size={18} />} label="Playground" isCollapsed={isCollapsed} />
            <SidebarNavItem icon={<PenTool size={18} />} label="Design" isCollapsed={isCollapsed} />
          </div>

          {/* Recents Section */}
          {!isCollapsed && (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium text-white/20">Recents</div>
              <div className="space-y-0.5">
                {chats
                  .slice()
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((chat) => (
                    <div
                      className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all cursor-pointer ${
                        chat.id === activeChatId ? "bg-white/5 text-white" : "text-white/40 hover:bg-white/[0.02] hover:text-white/80"
                      }`}
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <MessageCircle size={18} className={`shrink-0 transition-opacity ${chat.id === activeChatId ? "opacity-100 text-indigo-400" : "opacity-40 group-hover:opacity-70"}`} />
                      <span className="flex-1 truncate text-sm font-medium tracking-tight">{chat.title}</span>
                      <button
                        className="rounded-lg p-1 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChat(chat.id);
                        }}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-[#111] ${isCollapsed ? 'flex flex-col items-center space-y-6' : 'space-y-4'}`}>
          <button className={`flex items-center transition-all group ${
            isCollapsed ? "justify-center" : "w-full gap-3 px-3 py-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
          }`}>
            <Palette size={18} className={`transition-transform group-hover:rotate-12 ${isCollapsed ? 'text-white/40 hover:text-white' : ''}`} />
            {!isCollapsed && <span className="text-sm font-medium">Theme: Dark</span>}
          </button>
          
          {isCollapsed ? (
            <div 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-inner cursor-pointer hover:bg-indigo-500/20 transition-all"
            >
              SS
            </div>
          ) : (
            <div className="p-3 bg-[#0A0A0A] border border-[#111] rounded-2xl flex items-center gap-3 group cursor-pointer hover:border-white/10 transition-all">
              <div className="relative">
                <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xs font-bold shadow-inner">
                  SS
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full shadow-lg"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate tracking-tight">Sourav Samanta</p>
                <p className="text-[10px] text-white/30 truncate font-medium">sourav@protocol.io</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarNavItem({ 
  icon, 
  label, 
  active = false, 
  isCollapsed = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  isCollapsed?: boolean;
}) {
  return (
    <div className={`flex items-center transition-all cursor-pointer group ${
      isCollapsed ? "w-6 h-6 justify-center rounded-xl" : "w-full gap-3 px-3 py-2 rounded-xl"
    } ${
      active ? "bg-white/5 text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/80"
    }`}>
      <span className="text-white/40 group-hover:text-white transition-colors shrink-0">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </div>
  );
}
