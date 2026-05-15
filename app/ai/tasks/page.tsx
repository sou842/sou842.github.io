"use client";

import React from "react";
import { BookOpenCheck, Check, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { useAI } from "../_components/ai-provider";
import { Button } from "@/components/ui/button";
import { KanbanView } from "./_components/kanban-view";
import { TaskTable } from "./_components/table-view";
import { TaskSidePanel } from "./_components/task-side-panel";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TasksPage() {
  const { setMobileSidebarOpen } = useAI();
  const [view, setView] = React.useState<"kanban" | "table">("kanban");
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null);

  const { data: result, isLoading } = useSWR("/api/tasks", fetcher);
  const tasks = result?.data || [];

  const handleCreateTask = async (data: any) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        mutate("/api/tasks");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!selectedTask?._id) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        mutate("/api/tasks");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    // Optimistic UI update
    mutate(
      "/api/tasks",
      (current: any) => {
        if (!current?.data) return current;
        return {
          ...current,
          data: current.data.map((t: any) =>
            String(t._id) === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        };
      },
      false
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!result.success) {
        mutate("/api/tasks"); // Rollback on failure
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      mutate("/api/tasks"); // Rollback on error
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        mutate("/api/tasks");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const openAddPanel = (status?: string) => {
    setSelectedTask(status ? { status } : null);
    setIsPanelOpen(true);
  };

  const openEditPanel = (task: any) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

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
                <BookOpenCheck className="size-4 text-indigo-200" />
              </div>

              <div>
                <h1 className="text-base font-medium tracking-tight text-white">Tasks</h1>
                <p className="text-xs text-white/35">Manage your upcoming tasks</p>
              </div>
            </div>

              <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                <button
                  onClick={() => setView("kanban")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer",
                    view === "kanban" ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setView("table")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer",
                    view === "table" ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Table
                </button>
              </div>

              <Button 
                onClick={() => openAddPanel()}
                className="h-9 px-4 rounded-full bg-white text-black hover:bg-white/90 transition flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span>New Task</span>
              </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-8xl px-5 py-12 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-white/20">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center">
              <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <BookOpenCheck className="size-8 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No tasks yet</h2>
              <p className="text-white/40 max-w-sm mb-8">
                Stay organized and keep track of your goals. Create your first task to get started.
              </p>
              <Button onClick={() => openAddPanel()} className="bg-white text-black">
                Create First Task
              </Button>
           </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {view === "kanban" ? (
              <KanbanView
                tasks={tasks}
                onEdit={openEditPanel}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTask={openAddPanel}
              />
            ) : (
              <TaskTable
                tasks={tasks}
                onEdit={openEditPanel}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            )}
          </motion.div>
        )}
      </div>

      <TaskSidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        task={selectedTask}
        onSubmit={selectedTask?._id ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
      />

      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none overflow-hidden h-[115vh] flex items-end">
        {/* <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" /> */}
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2810%29-UnDKstODkIENp5xqTYUEpt0Sm8tNOw.png" 
          alt="Decorative Background" 
          className="w-full h-auto object-cover object-bottom opacity-70 mix-blend-lighten scale-110"
        />
      </div>
    </>
  );
}
