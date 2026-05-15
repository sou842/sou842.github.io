"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Check,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Sidebar } from "@/components/ai/sidebar";

import {
  createEmptyChat,
  loadStoredChats,
  syncChatsWithDatabase,
  deleteStoredChat,
  saveStoredChat,
  type StoredChat,
} from "@/lib/chat-storage";

import {
  createMemoryItem,
  loadStoredMemories,
  syncMemoriesWithDatabase,
  saveStoredMemory,
  deleteStoredMemory,
  memoryCategories,
  parseMemoryTags,
  type MemoryCategory,
  type MemoryItem,
} from "@/lib/memory-storage";

const emptyForm = {
  title: "",
  content: "",
  category: "fact" as MemoryCategory,
  tags: "",
  enabled: true,
};

export default function MemoryPage() {
  const router = useRouter();

  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [memories, setMemories] = useState<MemoryItem[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    MemoryCategory | "all"
  >("all");

  const [form, setForm] = useState(emptyForm);

  const [isSyncing, setIsSyncing] = useState(true);

  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsSyncing(true);

      try {
        await Promise.all([
          syncChatsWithDatabase(),
          syncMemoriesWithDatabase(),
        ]);

        const [storedChats, storedMemories] = await Promise.all([
          loadStoredChats(),
          loadStoredMemories(),
        ]);

        if (storedChats.length) {
          setChats(storedChats);
          setActiveChatId(storedChats[0].id);
        } else {
          const initial = createEmptyChat();
          setChats([initial]);
          setActiveChatId(initial.id);
        }

        setMemories(storedMemories);
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync data.");
      } finally {
        setIsSyncing(false);
      }
    };

    init();
  }, []);

  const filteredMemories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesCategory =
        categoryFilter === "all" ||
        memory.category === categoryFilter;

      const searchable = `${memory.title} ${memory.content} ${memory.tags.join(
        " "
      )}`.toLowerCase();

      return (
        matchesCategory &&
        (!normalizedQuery ||
          searchable.includes(normalizedQuery))
      );
    });
  }, [memories, query, categoryFilter]);

  const enabledCount = memories.filter(
    (memory) => memory.enabled
  ).length;

  const disabledCount = memories.filter(
    (memory) => !memory.enabled
  ).length;

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenDrawer(false);
  };

  const submitMemory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const content = form.content.trim();

    if (!content) {
      toast.error("Add something for Jarvis to remember.");
      return;
    }

    if (editingId) {
      const updatedMemory: Partial<MemoryItem> = {
        id: editingId,
        title: form.title.trim() || undefined,
        content,
        category: form.category,
        tags: parseMemoryTags(form.tags),
        enabled: form.enabled,
      };

      const saved = await saveStoredMemory(updatedMemory);

      if (saved) {
        setMemories((prev) =>
          prev.map((m) =>
            m.id === editingId
              ? {
                ...m,
                ...updatedMemory,
                updatedAt: Date.now(),
              }
              : m
          )
        );

        toast.success("Memory updated.");
        resetForm();
      }

      return;
    }

    const nextMemory = createMemoryItem({
      title: form.title,
      content,
      category: form.category,
      source: "manual",
      tags: parseMemoryTags(form.tags),
      enabled: form.enabled,
    });

    const saved = await saveStoredMemory(nextMemory);

    if (saved) {
      const mappedSaved = {
        ...saved,
        id: saved._id,
      };

      setMemories((prev) => [mappedSaved, ...prev]);

      toast.success("Memory saved.");
      resetForm();
    }
  };

  const editMemory = (memory: MemoryItem) => {
    setEditingId(memory.id);

    setForm({
      title: memory.title,
      content: memory.content,
      category: memory.category,
      tags: memory.tags.join(", "),
      enabled: memory.enabled,
    });

    setOpenDrawer(true);
  };

  const toggleMemory = async (id: string) => {
    const memory = memories.find((m) => m.id === id);

    if (!memory) return;

    const updated = {
      id,
      enabled: !memory.enabled,
    };

    const saved = await saveStoredMemory(updated);

    if (saved) {
      setMemories((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
              ...m,
              enabled: !m.enabled,
            }
            : m
        )
      );
    }
  };

  const deleteMemory = async (id: string) => {
    const ok = await deleteStoredMemory(id);

    if (ok) {
      setMemories((prev) =>
        prev.filter((m) => m.id !== id)
      );

      toast.success("Memory removed.");

      if (editingId === id) {
        resetForm();
      }
    }
  };

  const createNewChat = () => {
    const next = createEmptyChat();

    setChats((prev) => [next, ...prev]);

    setActiveChatId(next.id);

    router.push("/ai");
  };

  const removeChat = async (id: string) => {
    await deleteStoredChat(id);

    const nextChats = chats.filter(
      (chat) => chat.id !== id
    );

    if (nextChats.length === 0) {
      const fallback = createEmptyChat();

      setChats([fallback]);
      setActiveChatId(fallback.id);

      return;
    }

    setChats(nextChats);

    if (activeChatId === id) {
      setActiveChatId(nextChats[0].id);
    }
  };

  const onRenameChat = async (
    id: string,
    title: string
  ) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title } : chat
      )
    );

    await saveStoredChat({ id, title } as any);
  };

  const onSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileSidebarOpen(false);
    router.push("/ai");
  };

  if (isSyncing) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          <span className="text-xs uppercase tracking-[0.3em] text-white/30">
            Syncing memories
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-black text-white">
      <div className="flex h-full relative">
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
          sidebarWidth={272}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* HEADER */}

          <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden size-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center"
                      onClick={() =>
                        setMobileSidebarOpen(true)
                      }
                    >
                      <Menu size={18} />
                    </button>

                    <div className="size-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      <Brain className="size-5 text-indigo-200" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Memory
                      </h1>

                      <p className="text-sm text-white/35 mt-1">
                        Manage what Jarvis remembers
                        across conversations
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/ai"
                  className="h-11 px-5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition flex items-center"
                >
                  Back to Chat
                </Link>
              </div>

              {/* STATS */}

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-2xl border border-white/10 bg-[#070707] p-4">
                  <div className="text-2xl font-semibold">
                    {enabledCount}
                  </div>
                  <div className="text-xs text-white/35 mt-1">
                    Active Memories
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#070707] p-4">
                  <div className="text-2xl font-semibold">
                    {disabledCount}
                  </div>
                  <div className="text-xs text-white/35 mt-1">
                    Disabled
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#070707] p-4">
                  <div className="text-2xl font-semibold">
                    {memoryCategories.length}
                  </div>
                  <div className="text-xs text-white/35 mt-1">
                    Categories
                  </div>
                </div>
              </div>

              {/* FILTERS */}

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" />

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search memories..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#070707] pl-11 pr-4 text-sm outline-none focus:border-white/20"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value as
                      | MemoryCategory
                      | "all"
                    )
                  }
                  className="h-12 rounded-2xl border border-white/10 bg-[#070707] px-4 text-sm outline-none focus:border-white/20"
                >
                  <option value="all">
                    All Categories
                  </option>

                  {memoryCategories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-7xl px-5 py-6">
            {filteredMemories.length === 0 ? (
              <div className="min-h-[500px] rounded-3xl border border-dashed border-white/10 bg-[#050505] flex flex-col items-center justify-center text-center px-6">
                <div className="size-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-5">
                  <Brain className="size-7 text-white/25" />
                </div>

                <h2 className="text-xl font-semibold">
                  No memories yet
                </h2>

                <p className="max-w-md mt-3 text-sm leading-7 text-white/35">
                  Save important preferences, facts,
                  and context for Jarvis to remember
                  across conversations.
                </p>

                <button
                  onClick={() =>
                    setOpenDrawer(true)
                  }
                  className="mt-6 h-11 px-5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                >
                  Add your first memory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMemories.map((memory) => (
                  <article
                    key={memory.id}
                    className={`group rounded-2xl border bg-[#070707] p-4 transition-all duration-200 hover:bg-[#0A0A0A] hover:border-white/15 ${memory.enabled
                      ? "border-white/10"
                      : "border-white/6 opacity-50"
                      }`}
                  >
                    <div className="mb-2">
                      <h2 className="text-sm font-medium leading-tight text-white/90">
                        {memory.title || "Untitled Memory"}
                      </h2>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/45 line-clamp-3 whitespace-pre-wrap">
                        {memory.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full border border-indigo-400/20 bg-indigo-400/10 text-[10px] font-medium text-indigo-200 capitalize">
                          {memory.category}
                        </span>

                        {!memory.enabled && (
                          <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/35">
                            Disabled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => toggleMemory(memory.id)}
                          className="size-7 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white"
                          title={memory.enabled ? "Disable" : "Enable"}
                        >
                          {memory.enabled ? <Check size={14} /> : <X size={14} />}
                        </button>
                        <button
                          onClick={() => editMemory(memory)}
                          className="size-7 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMemory(memory.id)}
                          className="size-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/40 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {(memory.tags.length > 0 || memory.source) && (
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {memory.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-white/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-white/20">
                          {memory.source}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* FLOATING BUTTON */}

        <button
          onClick={() => {
            resetForm();
            setOpenDrawer(true);
          }}
          className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-2xl bg-white text-black shadow-2xl flex items-center gap-2 text-sm font-semibold hover:bg-white/90 transition"
        >
          <Plus size={18} />
          Add Memory
        </button>

        {/* DRAWER */}

        <div
          className={`fixed inset-0 z-50 transition ${openDrawer
            ? "pointer-events-auto"
            : "pointer-events-none"
            }`}
        >
          <div
            onClick={resetForm}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition ${openDrawer
              ? "opacity-100"
              : "opacity-0"
              }`}
          />

          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-black transition-transform duration-300 ${openDrawer
              ? "translate-x-0"
              : "translate-x-full"
              }`}
          >
            <form
              onSubmit={submitMemory}
              className="h-full flex flex-col"
            >
              <div className="h-16 border-b border-white/10 px-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {editingId
                      ? "Edit Memory"
                      : "Add Memory"}
                  </h2>

                  <p className="text-xs text-white/35 mt-1">
                    Enabled memories are used in
                    future chats
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="size-9 rounded-xl hover:bg-white/[0.05] flex items-center justify-center text-white/40"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-white/40">
                      Title
                    </label>

                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Short label"
                      className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#070707] px-4 text-sm outline-none focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40">
                      Memory
                    </label>

                    <textarea
                      value={form.content}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Remember that..."
                      className="mt-2 min-h-[180px] w-full resize-none rounded-2xl border border-white/10 bg-[#070707] p-4 text-sm leading-7 outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/40">
                        Category
                      </label>

                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            category:
                              e.target
                                .value as MemoryCategory,
                          }))
                        }
                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#070707] px-4 text-sm outline-none focus:border-white/20"
                      >
                        {memoryCategories.map(
                          (category) => (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {category.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/40">
                        Status
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            enabled:
                              !prev.enabled,
                          }))
                        }
                        className={`mt-2 h-12 w-full rounded-2xl border text-sm font-medium transition ${form.enabled
                          ? "border-indigo-400/20 bg-indigo-400/10 text-indigo-100"
                          : "border-white/10 bg-[#070707] text-white/35"
                          }`}
                      >
                        {form.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40">
                      Tags
                    </label>

                    <input
                      value={form.tags}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="react, work, preference"
                      className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#070707] px-4 text-sm outline-none focus:border-white/20"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-white/10">
                <button
                  type="submit"
                  disabled={!form.content.trim()}
                  className="h-12 w-full rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 transition"
                >
                  {editingId
                    ? "Update Memory"
                    : "Save Memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}