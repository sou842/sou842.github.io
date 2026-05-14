"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { FileUIPart, UIMessage } from "ai";
import {
  CheckIcon,
  Copy,
  Globe,
  Menu,
  PanelLeftOpen,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Sidebar } from "@/components/ai/sidebar";
import { ChatInput, mistralModels } from "@/components/ai/chat-input";
import { MessageList, getMessageText } from "@/components/ai/message-list";
import { EmptyState } from "@/components/ai/empty-state";

const STORAGE_KEY = "jarvis-chat-history-v1";

export type StoredChat = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const deriveTitle = (messages: UIMessage[]) => {
  const firstUser = messages.find((m) => m.role === "user");
  const text = firstUser ? getMessageText(firstUser).trim() : "";
  return text ? text.slice(0, 44) : "New Chat";
};

const createEmptyChat = (): StoredChat => ({
  id: crypto.randomUUID(),
  messages: [],
  title: "New Chat",
  updatedAt: Date.now(),
});

export default function AIPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef(false);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(mistralModels[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");

  const { messages, sendMessage, status, regenerate, setMessages } = useChat({
    onError: (err) => {
      console.error("Chat error:", err);
      toast.error("Chat request failed. Please try again.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createEmptyChat();
      setChats([initial]);
      setActiveChatId(initial.id);
      setMessages(initial.messages);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredChat[];
      if (parsed.length === 0) {
        const initial = createEmptyChat();
        setChats([initial]);
        setActiveChatId(initial.id);
        setMessages(initial.messages);
        return;
      }
      setChats(parsed);
      setActiveChatId(parsed[0].id);
      setMessages(parsed[0].messages);
    } catch {
      const initial = createEmptyChat();
      setChats([initial]);
      setActiveChatId(initial.id);
      setMessages(initial.messages);
    }
  }, [setMessages]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (!activeChatId) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
            ...chat,
            messages,
            title: deriveTitle(messages),
            updatedAt: Date.now(),
          }
          : chat
      )
    );
  }, [messages, activeChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const next = Math.min(520, Math.max(240, event.clientX));
      setSidebarWidth(next);
    };
    const onMouseUp = () => {
      resizeRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const selectedModelData = useMemo(
    () => mistralModels.find((model) => model.id === selectedModel),
    [selectedModel]
  );

  const startResize = () => {
    resizeRef.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const createNewChat = () => {
    const next = createEmptyChat();
    setChats((prev) => [next, ...prev]);
    setActiveChatId(next.id);
    setInput("");
    setMessages([]);
  };

  const removeChat = (id: string) => {
    const filtered = chats.filter((chat) => chat.id !== id);
    
    if (filtered.length === 0) {
      const fallback = createEmptyChat();
      setChats([fallback]);
      setActiveChatId(fallback.id);
      setMessages([]);
      return;
    }
    
    if (id === activeChatId) {
      const nextChat = filtered[0];
      setActiveChatId(nextChat.id);
      setMessages(nextChat.messages);
    }
    
    setChats(filtered);
  };

  const onSelectChat = (id: string) => {
    const selected = chats.find((chat) => chat.id === id);
    if (selected) {
      setMessages(selected.messages);
    }
    setActiveChatId(id);
    setMobileSidebarOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Unable to copy"));
  };

  return (
    <div className="h-screen overflow-hidden bg-[#000000] text-[#E5E5E5] font-sans selection:bg-primary/30">
      <div className="relative flex h-full">
        <Sidebar
          activeChatId={activeChatId}
          chats={chats}
          createNewChat={createNewChat}
          mobileSidebarOpen={mobileSidebarOpen}
          onSelectChat={onSelectChat}
          removeChat={removeChat}
          setMobileSidebarOpen={setMobileSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
        />

        {sidebarOpen && (
          <button
            className="relative z-20 hidden w-px cursor-col-resize bg-zinc-800/60 transition hover:bg-zinc-600 md:block"
            onMouseDown={startResize}
            type="button"
          />
        )}



        <main className="relative flex min-w-0 flex-1 flex-col bg-[#000000]">
          <header className="h-16 border-b border-[#111] flex items-center justify-between px-6 z-20 backdrop-blur-2xl bg-[#000000]/70 sticky top-0">
            <div className="flex items-center gap-4">
              <button
                className="rounded-xl border border-white/5 bg-white/5 p-2 text-white/40 md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                type="button"
              >
                <Menu size={16} />
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 md:flex hidden">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Core Status: Stable</span>
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

          <div className="flex-1 overflow-y-auto px-4 py-10 scroll-smooth scrollbar-hide" ref={scrollRef}>
            <div className="mx-auto w-full max-w-3xl space-y-12 pb-40">
              {messages.length === 0 ? (
                <EmptyState
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessage}
                  selectedModel={selectedModel}
                />
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  copyToClipboard={copyToClipboard}
                  regenerate={regenerate}
                  selectedModel={selectedModel}
                />
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent z-10" />
          {!!messages.length &&
            <ChatInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              sendMessage={sendMessage}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedModelData={selectedModelData}
              modelSelectorOpen={modelSelectorOpen}
              setModelSelectorOpen={setModelSelectorOpen}
            />}
        </main>
      </div>
    </div>
  );
}
