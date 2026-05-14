"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Brain, Check, Menu, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Sidebar } from "@/components/ai/sidebar";
import {
  createEmptyChat,
  loadStoredChats,
  saveStoredChats,
  type StoredChat,
} from "@/lib/chat-storage";
import {
  createMemoryItem,
  loadMemories,
  memoryCategories,
  parseMemoryTags,
  saveMemories,
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
  const [categoryFilter, setCategoryFilter] = useState<MemoryCategory | "all">("all");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const storedChats = loadStoredChats();
    if (storedChats.length) {
      setChats(storedChats);
      setActiveChatId(storedChats[0].id);
    } else {
      const initial = createEmptyChat();
      setChats([initial]);
      setActiveChatId(initial.id);
      saveStoredChats([initial]);
    }

    setMemories(loadMemories());
  }, []);

  const persistMemories = (next: MemoryItem[]) => {
    setMemories(next);
    saveMemories(next);
  };

  const filteredMemories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesCategory = categoryFilter === "all" || memory.category === categoryFilter;
      const searchable = `${memory.title} ${memory.content} ${memory.tags.join(" ")}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [memories, query, categoryFilter]);

  const enabledCount = memories.filter((memory) => memory.enabled).length;

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitMemory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = form.content.trim();
    if (!content) {
      toast.error("Add something for Jarvis to remember.");
      return;
    }

    if (editingId) {
      const next = memories.map((memory) =>
        memory.id === editingId
          ? {
              ...memory,
              title: form.title.trim() || memory.title,
              content,
              category: form.category,
              tags: parseMemoryTags(form.tags),
              enabled: form.enabled,
              updatedAt: Date.now(),
            }
          : memory
      );
      persistMemories(next);
      toast.success("Memory updated.");
      resetForm();
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
    persistMemories([nextMemory, ...memories]);
    toast.success("Memory saved.");
    resetForm();
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
  };

  const toggleMemory = (id: string) => {
    persistMemories(
      memories.map((memory) =>
        memory.id === id
          ? { ...memory, enabled: !memory.enabled, updatedAt: Date.now() }
          : memory
      )
    );
  };

  const deleteMemory = (id: string) => {
    persistMemories(memories.filter((memory) => memory.id !== id));
    if (editingId === id) {
      resetForm();
    }
    toast.success("Memory removed.");
  };

  const createNewChat = () => {
    const next = createEmptyChat();
    const nextChats = [next, ...chats];
    setChats(nextChats);
    setActiveChatId(next.id);
    saveStoredChats(nextChats);
    router.push("/ai");
  };

  const removeChat = (id: string) => {
    const nextChats = chats.filter((chat) => chat.id !== id);
    if (nextChats.length === 0) {
      const fallback = createEmptyChat();
      setChats([fallback]);
      setActiveChatId(fallback.id);
      saveStoredChats([fallback]);
      return;
    }

    setChats(nextChats);
    if (activeChatId === id) {
      setActiveChatId(nextChats[0].id);
    }
    saveStoredChats(nextChats);
  };

  const onSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileSidebarOpen(false);
    router.push("/ai");
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-[#E5E5E5] font-sans selection:bg-primary/30">
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
          sidebarWidth={272}
        />

        <main className="relative flex min-w-0 flex-1 flex-col bg-black">
          <header className="h-16 border-b border-[#111] flex items-center justify-between px-6 z-20 backdrop-blur-2xl bg-black/70 sticky top-0">
            <div className="flex items-center gap-4">
              <button
                className="rounded-xl border border-white/5 bg-white/5 p-2 text-white/40 md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                type="button"
              >
                <Menu size={16} />
              </button>
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-indigo-300" />
                <span className="text-sm font-semibold text-white">Memory</span>
                <span className="hidden text-xs text-white/30 sm:inline">
                  {enabledCount} active / {memories.length} total
                </span>
              </div>
            </div>

            <Link className="btn btn-ghost btn-sm text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all" href="/ai">
              Back to Chat
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <section className="min-w-0 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/25" />
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0A0A0A] pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400/40"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search memories"
                      value={query}
                    />
                  </div>
                  <select
                    className="h-11 rounded-xl border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white outline-none transition focus:border-indigo-400/40"
                    onChange={(event) => setCategoryFilter(event.target.value as MemoryCategory | "all")}
                    value={categoryFilter}
                  >
                    <option value="all">All categories</option>
                    {memoryCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredMemories.length === 0 ? (
                    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#050505] px-6 text-center">
                      <Brain className="mb-4 size-8 text-white/20" />
                      <h2 className="text-lg font-semibold text-white">No memories found</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
                        Add a memory manually here, or save useful facts from any chat message with the brain action.
                      </p>
                    </div>
                  ) : (
                    filteredMemories.map((memory) => (
                      <article
                        className={`rounded-2xl border bg-[#070707] p-4 transition ${
                          memory.enabled ? "border-white/10" : "border-white/5 opacity-55"
                        }`}
                        key={memory.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[11px] font-medium capitalize text-indigo-200">
                                {memory.category}
                              </span>
                              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium capitalize text-white/35">
                                {memory.source}
                              </span>
                              {!memory.enabled && (
                                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/30">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <h2 className="truncate text-base font-semibold text-white">{memory.title}</h2>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{memory.content}</p>
                            {memory.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {memory.tags.map((tag) => (
                                  <span className="text-xs text-white/30" key={tag}>
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              className="flex size-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/5 hover:text-white"
                              onClick={() => toggleMemory(memory.id)}
                              title={memory.enabled ? "Disable memory" : "Enable memory"}
                              type="button"
                            >
                              {memory.enabled ? <Check size={16} /> : <X size={16} />}
                            </button>
                            <button
                              className="flex size-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/5 hover:text-white"
                              onClick={() => editMemory(memory)}
                              title="Edit memory"
                              type="button"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="flex size-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => deleteMemory(memory.id)}
                              title="Delete memory"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <form className="rounded-2xl border border-white/10 bg-[#070707] p-5" onSubmit={submitMemory}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        {editingId ? "Edit Memory" : "Add Memory"}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-white/35">
                        Enabled memories are included with future chat requests.
                      </p>
                    </div>
                    {editingId ? (
                      <button
                        className="rounded-lg px-2 py-1 text-xs text-white/35 transition hover:bg-white/5 hover:text-white"
                        onClick={resetForm}
                        type="button"
                      >
                        Cancel
                      </button>
                    ) : (
                      <Plus className="size-4 text-white/25" />
                    )}
                  </div>

                  <label className="mb-4 block">
                    <span className="mb-2 block text-xs font-medium text-white/45">Title</span>
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/40"
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Short label"
                      value={form.title}
                    />
                  </label>

                  <label className="mb-4 block">
                    <span className="mb-2 block text-xs font-medium text-white/45">Memory</span>
                    <textarea
                      className="min-h-36 w-full resize-none rounded-xl border border-white/10 bg-black px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/40"
                      onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                      placeholder="Remember that..."
                      value={form.content}
                    />
                  </label>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium text-white/45">Category</span>
                      <select
                        className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm capitalize text-white outline-none transition focus:border-indigo-400/40"
                        onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as MemoryCategory }))}
                        value={form.category}
                      >
                        {memoryCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium text-white/45">Status</span>
                      <button
                        className={`h-11 w-full rounded-xl border px-3 text-sm font-medium transition ${
                          form.enabled
                            ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-100"
                            : "border-white/10 bg-black text-white/35"
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                        type="button"
                      >
                        {form.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </label>
                  </div>

                  <label className="mb-5 block">
                    <span className="mb-2 block text-xs font-medium text-white/45">Tags</span>
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-indigo-400/40"
                      onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                      placeholder="react, work, preference"
                      value={form.tags}
                    />
                  </label>

                  <button
                    className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/20"
                    disabled={!form.content.trim()}
                    type="submit"
                  >
                    {editingId ? "Update Memory" : "Save Memory"}
                  </button>
                </form>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
