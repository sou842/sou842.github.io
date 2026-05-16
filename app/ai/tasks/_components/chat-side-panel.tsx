"use client";

import React, { useRef } from "react";
import { MessageList } from "@/components/ai/message-list";
import { ChatInput, mistralModels } from "@/components/ai/chat-input";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Bot, X, Trash2, Maximize2, Minimize2, MessageSquare, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { UIMessage } from "ai";

interface ChatSidePanelProps {
  messages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  sendMessage: (message: any, options?: any) => void;
  regenerate: (options?: any) => void;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  onClose: () => void;
  selectedTask: any | null;
  setSelectedTask: (task: any | null) => void;
  onClearChat: () => void;
}

export function ChatSidePanel({
  messages,
  input,
  setInput,
  isLoading,
  sendMessage,
  regenerate,
  selectedModel,
  setSelectedModel,
  onClose,
  selectedTask,
  setSelectedTask,
  onClearChat
}: ChatSidePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: "chat-input-dropzone",
  });

  const selectedModelData = mistralModels.find((m) => m.id === selectedModel);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full bg-zinc-950/50 backdrop-blur-3xl border-l border-white/10 relative transition-all duration-300",
        isOver && "ring-4 ring-indigo-500/30 bg-indigo-500/5"
      )}
    >
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-white/5 px-6 flex items-center justify-between bg-black/20">

          <Button
            variant="outline"
            // size="icon"
            onClick={onClearChat}
            className="rounded-full transition-colors"
            title="Clear Chat"
          >
            <MessageCircle size={14} /> Chat
          </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="size-8 bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Drop Indicator Overlay */}
      <AnimatePresence>
        {isOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-indigo-500/20 backdrop-blur-md flex items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-indigo-600 text-white px-8 py-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 border border-indigo-400/50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
              <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce relative z-10">
                <MessageSquare className="size-8" />
              </div>
              <div className="relative z-10">
                <span className="font-bold text-xl block mb-1">Drop to Focus Task</span>
                <span className="text-sm text-indigo-100 opacity-90">Jarvis will prioritize this task in the conversation</span>
              </div>
              
              {/* Animated pulse rings */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 border-4 border-white/20 rounded-[2rem] animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 border-4 border-white/10 rounded-[2rem] animate-ping opacity-10" style={{ animationDuration: '4s', animationDelay: '1s' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message List */}
      <div className="flex-1 overflow-hidden relative pb-6">
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Bot className="size-8 text-white/60" />
            </div>
            <h3 className="text-white font-medium mb-2">How can I help you?</h3>
            <p className="text-sm text-white/30 max-w-[240px]">
              Drag a task here to discuss it, or just start typing to manage your workflow.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-hide p-4 pt-8 pb-32" ref={scrollContainerRef}>
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              copyToClipboard={(text) => navigator.clipboard.writeText(text)}
              onSaveMemory={() => {}}
              regenerate={regenerate}
              selectedModel={selectedModel}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          sendMessage={(msg, opts) => sendMessage(msg, opts)}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedModelData={selectedModelData}
          modelSelectorOpen={false}
          setModelSelectorOpen={() => {}}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          space={2}
        />
      </div>
    </div>
  );
}
