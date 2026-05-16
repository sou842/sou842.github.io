"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, Database } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { NoteEditor } from "../_components/note-editor";
import { SpreadsheetEditor } from "../_components/spreadsheet-editor";
import { useAI } from "../../_components/ai-provider";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function VaultItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { setMobileSidebarOpen } = useAI();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/vault/${id}` : null,
    fetcher
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.item) {
      setTitle(data.item.title);
      setContent(data.item.content);
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        toast.success("Item updated");
        mutate();
      } else {
        toast.error("Failed to save item");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        router.push("/ai/vault");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <p className="text-red-400 mb-4">Failed to load item</p>
        <Link href="/ai/vault" className="text-sm text-white/40 hover:text-white underline">Back to Vault</Link>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl shrink-0">
        <div className="mx-auto max-w-8xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/ai/vault"
                className="size-10 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center hover:bg-white/5 transition"
              >
                <ArrowLeft size={18} />
              </Link>
              
              <div className="flex-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-none text-lg font-semibold text-white outline-none w-full max-w-md placeholder:text-white/20"
                  placeholder="Enter title..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/10 transition cursor-pointer"
                title="Delete item"
              >
                <Trash2 size={18} />
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading || content === null}
                className="flex items-center gap-2 px-5 h-11 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition cursor-pointer"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-[#070707] relative">
        {isLoading || content === null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          </div>
        ) : (
          <div className="h-full w-full">
            {data.item.type === "note" ? (
              <NoteEditor 
                key={id}
                initialData={content} 
                onChange={setContent} 
              />
            ) : (
              <SpreadsheetEditor 
                key={id}
                initialData={content} 
                onChange={setContent} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
