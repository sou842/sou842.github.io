"use client";

import React, { useState } from "react";
import { Database, Menu, Search, Plus, FileText, Table2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { format } from "date-fns";
import { toast } from "sonner";

import { useAI } from "../_components/ai-provider";
import { VaultItemDialog } from "./_components/vault-item-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VaultPage() {
  const router = useRouter();
  const { setMobileSidebarOpen } = useAI();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "note" | "spreadsheet">("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id?: string, type: "note" | "spreadsheet" } | null>(null);

  const { data, error, isLoading, mutate } = useSWR(`/api/vault?search=${query}&type=${filterType === 'all' ? '' : filterType}`, fetcher);

  const items = data?.items || [];

  const handleCreate = (type: "note" | "spreadsheet") => {
    setSelectedItem({ type });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    router.push(`/ai/vault/${item._id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        mutate();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl shrink-0">
        <div className="mx-auto max-w-8xl px-5 py-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden size-10 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center cursor-pointer"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>

                <div className="size-11 rounded-2xl bg-white/4 border border-white/10 flex items-center justify-center">
                  <Database className="size-5 text-indigo-200" />
                </div>

                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Vault</h1>
                  <p className="text-xs text-white/35">Manage your stored data and documents</p>
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

          {/* FILTERS & SEARCH */}
          <div className="mt-6 flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search vault..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#070707] pl-11 pr-4 text-sm outline-none focus:border-white/20"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-12 rounded-2xl border border-white/10 bg-[#070707] px-4 text-sm outline-none focus:border-white/20 shrink-0"
              >
                <option value="all">All Types</option>
                <option value="note">Notes</option>
                <option value="spreadsheet">Spreadsheets</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="h-12 px-5 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition flex items-center gap-2 cursor-pointer">
                  <Plus size={16} />
                  New Item
                </button>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-[#0F0F0F] border border-white/10 rounded-xl w-48 mt-2">
                  <li>
                    <button onClick={() => handleCreate("note")} className="flex items-center gap-2 py-2 text-sm hover:bg-white/5">
                      <FileText size={16} className="text-blue-400" />
                      New Note
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleCreate("spreadsheet")} className="flex items-center gap-2 py-2 text-sm hover:bg-white/5">
                      <Table2 size={16} className="text-green-400" />
                      New Spreadsheet
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-8xl">
          {isLoading ? (
             <div className="flex justify-center py-20">
               <div className="size-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
             </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">Failed to load vault items.</div>
          ) : items.length === 0 ? (
            <div className="min-h-[400px] rounded-3xl border border-dashed border-white/10 bg-[#050505] flex flex-col items-center justify-center text-center px-6">
              <div className="size-16 rounded-3xl bg-white/3 border border-white/10 flex items-center justify-center mb-5">
                <Database className="size-7 text-white/25" />
              </div>
              <h2 className="text-xl font-semibold">Vault is empty</h2>
              <p className="max-w-md mt-3 text-sm leading-7 text-white/35">
                Create a note or spreadsheet, or ask Jarvis to save data for you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item: any) => (
                <div 
                  key={item._id} 
                  onClick={() => handleEdit(item)}
                  className="group relative flex flex-col p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      {item.type === 'note' ? (
                        <FileText size={20} className="text-blue-400" />
                      ) : (
                        <Table2 size={20} className="text-green-400" />
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-white truncate mb-1">{item.title}</h3>
                  <div className="text-xs text-white/40 mb-4 flex items-center gap-2">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span>{format(new Date(item.updatedAt), 'MMM d, yyyy')}</span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-4 border-t border-white/5">
                      {item.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/50 border border-white/5">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/50 border border-white/5">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dialogOpen && selectedItem && (
        <VaultItemDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedItem(null);
            mutate();
          }}
          itemId={selectedItem.id}
          type={selectedItem.type}
        />
      )}
    </div>
  );
}
