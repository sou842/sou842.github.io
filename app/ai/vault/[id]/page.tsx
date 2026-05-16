"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, Database, FileText, Table2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { NoteEditor } from "../_components/note-editor";
import { SpreadsheetEditor } from "../_components/spreadsheet-editor";
import { PageHeader } from "../../_components/page-header";
import { useAI } from "../../_components/ai-provider";
import { Button } from "@/components/ui/button";

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

  const item = data?.item;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A]">
      <PageHeader
        backHref="/ai/vault"
        icon={item?.type === "note" ? <FileText /> : <Table2 />}
        title={
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-base font-medium text-white outline-none w-full max-w-md placeholder:text-white/20 px-0"
            placeholder="Enter title..."
          />
        }
        subtitle={item?.updatedAt ? `Last updated: ${new Date(item.updatedAt).toLocaleDateString()}` : "Untitled Item"}
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              onClick={handleDelete}
              variant="outline"
              className="h-9 w-9 rounded-full text-white/20 hover:text-red-500 border-red-500/20 hover:bg-red-500/10 transition cursor-pointer"
              title="Delete item"
            >
              <Trash2 size={16} className="text-red-400/40" />
            </Button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        }
      />

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
