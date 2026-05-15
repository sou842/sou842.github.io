"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Sidebar } from "@/components/ai/sidebar";
import { ChatInput, mistralModels } from "@/components/ai/chat-input";
import { MessageList } from "@/components/ai/message-list";
import { ChatHeader } from "@/components/ai/chat-header";
import { EmptyState } from "@/components/ai/empty-state";
import { useSidebarResize } from "@/app/ai/_hooks/use-sidebar-resize";
import { getSaveMemoryToolOutputs } from "@/app/ai/_lib/chat-tools";
import { getMessageText } from "@/lib/ai/message-utils";
import {
  createEmptyChat,
  deriveChatTitle,
  loadStoredChats,
  loadChatDetails,
  syncChatsWithDatabase,
  deleteStoredChat,
  saveStoredChat,
  type StoredChat,
} from "@/lib/chat-storage";
import { 
  addMemory, 
  syncMemoriesWithDatabase, 
  loadStoredMemories,
  inferMemoryCategory, 
  type MemoryItem 
} from "@/lib/memory-storage";

function AIPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(mistralModels[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { sidebarWidth, startResize } = useSidebarResize();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const activeChatIdRef = useRef("");
  const persistedToolCallsRef = useRef(new Set<string>());
  const [isSyncing, setIsSyncing] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chat = useChat({
    onFinish: async ({ message }) => {
      // If this was a new chat (no messages before this run), add it to the sidebar and update URL
      // We check if the chat is already in our list
      const isNewChat = !chats.find(c => c.id === activeChatId);
      if (isNewChat) {
        const firstUserMessage = messages.find(m => m.role === 'user');
        const assistantText = getMessageText(message);
        const assistantMessage = { ...message, content: assistantText };
        
        // Construct the full history for the new chat
        const newChatMessages = firstUserMessage 
          ? [...messages, assistantMessage]
          : [{ role: 'user' as const, content: 'New Chat' }, assistantMessage];

        const newChat: StoredChat = {
          id: activeChatId,
          title: deriveChatTitle(newChatMessages),
          messages: newChatMessages,
          updatedAt: Date.now()
        };
        setChats(prev => [newChat, ...prev]);
        router.replace(`/ai?q=${activeChatId}`);
      }

      for (const { toolCallId, output } of getSaveMemoryToolOutputs(message)) {
        if (persistedToolCallsRef.current.has(toolCallId)) {
          continue;
        }

        persistedToolCallsRef.current.add(toolCallId);
        const newMemory = await addMemory({
          title: output.memory.title,
          content: output.memory.content,
          category: output.memory.category,
          source: "chat",
          tags: [...new Set([...output.memory.tags, "chat", "tool"])],
        });
        
        if (newMemory) {
          setMemories(prev => [newMemory, ...prev]);
        }
        toast.success("Saved to memory.");
      }
    },
    onError: (err) => {
      console.error("Chat error:", err);
      toast.error("Chat request failed. Please try again.");
    },
  });
  
  const { messages, sendMessage, status, regenerate, setMessages, reload, append } = chat;

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const init = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([syncChatsWithDatabase(), syncMemoriesWithDatabase()]);
        
        const [parsedChats, parsedMemories] = await Promise.all([
          loadStoredChats(),
          loadStoredMemories()
        ]);
        
        setMemories(parsedMemories);
        setChats(parsedChats);

        if (parsedChats.length === 0) {
          const initial = createEmptyChat();
          setChats([initial]);
          setActiveChatId(initial.id);
          setMessages(initial.messages || []);
          return;
        }

        const q = searchParams.get("q");
        
        if (!q) {
          // New chat mode
          const next = createEmptyChat();
          setActiveChatId(next.id);
          setMessages([]);
          activeChatIdRef.current = next.id;
          return;
        }

        const initialSummary = parsedChats.find((c) => c.id === q);
        if (!initialSummary) {
          // Invalid ID or not found, fallback to new chat or first chat?
          // For safety, let's go to new chat
          router.replace("/ai");
          return;
        }

        const fullChat = await loadChatDetails(initialSummary.id);
        
        if (fullChat) {
          setActiveChatId(fullChat.id);
          setMessages(fullChat.messages || []);
          activeChatIdRef.current = fullChat.id;
        }
      } catch (error) {
        console.error("Failed to initialize AI data:", error);
        toast.error("Failed to sync with database.");
      } finally {
        setIsSyncing(false);
      }
    };
    init();
  }, [setMessages, searchParams]);

  // Local storage auto-save removed as we use MongoDB

  useEffect(() => {
    if (!activeChatId || activeChatId !== activeChatIdRef.current) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
            ...chat,
            messages,
            title: deriveChatTitle(messages),
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

  const selectedModelData = useMemo(
    () => mistralModels.find((model) => model.id === selectedModel),
    [selectedModel]
  );

  const createNewChat = () => {
    const next = createEmptyChat();
    // We don't add it to chats list yet, just set it as active
    setActiveChatId(next.id);
    activeChatIdRef.current = next.id;
    setInput("");
    setMessages([]);
    router.replace("/ai"); // Clear the URL
  };

  const removeChat = async (id: string) => {
    const filtered = chats.filter((chat) => chat.id !== id);
    
    await deleteStoredChat(id);

    if (filtered.length === 0) {
      const fallback = createEmptyChat();
      setChats([fallback]);
      setActiveChatId(fallback.id);
      setMessages([]);
      return;
    }
    
    if (id === activeChatId) {
      const nextChatSummary = filtered[0];
      setActiveChatId(nextChatSummary.id);
      activeChatIdRef.current = nextChatSummary.id;
      router.replace(`/ai?q=${nextChatSummary.id}`);
      
      // Load full details for the next chat
      loadChatDetails(nextChatSummary.id).then(fullChat => {
        if (fullChat) {
          setMessages(fullChat.messages || []);
        } else {
          setMessages([]);
        }
      });
    }
    
    setChats(filtered);
  };

  const onRenameChat = async (id: string, title: string) => {
    setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)));
    await saveStoredChat({ id, title } as any);
  };

  const onEditMessage = async (id: string, content: string) => {
    // Find the index of the edited message
    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1) return;

    // Truncate and update the edited message
    const updatedMessage = { ...messages[messageIndex], content };
    const truncatedMessages = [...messages.slice(0, messageIndex), updatedMessage];
    
    // Update local state
    setMessages(truncatedMessages);

    // Persist to database
    await saveStoredChat({
      id: activeChatId,
      messages: truncatedMessages,
      updatedAt: Date.now()
    } as any);

    // Trigger regeneration from this point
    try {
      if (typeof (chat as any).reload === 'function') {
        await (chat as any).reload();
      } else if (typeof (chat as any).regenerate === 'function') {
        await (chat as any).regenerate();
      } else {
        // Fallback: manually trigger a re-render or toast
        console.warn('Neither reload nor regenerate found on useChat return object');
      }
    } catch (e) {
      console.error('Failed to reload chat:', e);
    }
  };

  const onSelectChat = async (id: string) => {
    setActiveChatId(id);
    setMobileSidebarOpen(false);
    router.replace(`/ai?q=${id}`);

    try {
      const fullChat = await loadChatDetails(id);
      if (fullChat) {
        setMessages(fullChat.messages || []);
        activeChatIdRef.current = id;
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
      toast.error("Failed to load chat history.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Unable to copy"));
  };

  const sendMessageWithMemory = async (
    message: Parameters<typeof sendMessage>[0],
    options?: Parameters<typeof sendMessage>[1]
  ) => {
    const enabledMemories = memories
      .filter((m) => m.enabled && m.content.trim())
      .slice(0, 24)
      .map(({ title, content, category, tags }) => ({ title, content, category, tags }));

    await sendMessage(message, {
      ...options,
      body: {
        ...options?.body,
        memories: enabledMemories,
        chatId: activeChatId,
      },
    });
  };

  const regenerateWithMemory = (options?: Parameters<typeof regenerate>[0]) => {
    const enabledMemories = memories
      .filter((m) => m.enabled && m.content.trim())
      .slice(0, 24)
      .map(({ title, content, category, tags }) => ({ title, content, category, tags }));

    regenerate({
      ...options,
      body: {
        ...options?.body,
        memories: enabledMemories,
        chatId: activeChatId,
      },
    });
  };

  const saveMessageToMemory = async (text: string) => {
    const content = text.trim();
    if (!content) {
      toast.error("Nothing to remember in this message.");
      return;
    }

    const newMemory = await addMemory({
      content,
      category: inferMemoryCategory(content),
      source: "chat",
      tags: ["chat"],
    });

    if (newMemory) {
      setMemories(prev => [newMemory, ...prev]);
      toast.success("Saved to memory.");
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen w-full bg-[#000000]" />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#000000] text-[#E5E5E5] font-sans selection:bg-primary/30">
      <div className="relative flex h-full">
        <Sidebar
          activeChatId={activeChatId}
          chats={chats}
          createNewChat={createNewChat}
          mobileSidebarOpen={mobileSidebarOpen}
          onSelectChat={onSelectChat}
          onRenameChat={onRenameChat}
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
          <ChatHeader 
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)} 
            isSyncing={isSyncing}
          />

          <div className="flex-1 overflow-y-auto px-4 py-10 scroll-smooth scrollbar-hide" ref={scrollRef}>
            <div className="mx-auto w-full max-w-3xl space-y-12 pb-40">
              {messages.length === 0 ? (
                <EmptyState
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessageWithMemory}
                  selectedModel={selectedModel}
                />
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  copyToClipboard={copyToClipboard}
                  onSaveMemory={saveMessageToMemory}
                  regenerate={regenerateWithMemory}
                  selectedModel={selectedModel}
                  onEditMessage={onEditMessage}
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
              sendMessage={sendMessageWithMemory}
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

export default function AIPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#000000] text-white/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Initializing Jarvis...</span>
        </div>
      </div>
    }>
      <AIPageContent />
    </Suspense>
  );
}
