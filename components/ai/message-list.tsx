"use client";

import React from "react";
import { UIMessage, FileUIPart } from "ai";
import { Brain, Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
  MessageAction,
  MessageActions,
} from "@/components/ai-elements/message";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
} from "@/components/ai-elements/attachments";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

export const getMessageText = (message: UIMessage) => {
  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }
  const legacyContent = (message as { content?: unknown }).content;
  return typeof legacyContent === "string" ? legacyContent : "";
};

export const getMessageReasoning = (message: UIMessage) => {
  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "reasoning")
      .map((part: any) => part.reasoning || part.text)
      .join("");
  }
  return "";
};

export const getMessageAttachments = (message: UIMessage): FileUIPart[] => {
  if (message.parts) {
    return message.parts.filter((part): part is FileUIPart => part.type === "file");
  }
  return [];
};

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  copyToClipboard: (text: string) => void;
  onSaveMemory: (text: string) => void;
  regenerate: (options?: any) => void;
  selectedModel: string;
}

export function MessageList({
  messages,
  isLoading,
  copyToClipboard,
  onSaveMemory,
  regenerate,
  selectedModel,
}: MessageListProps) {
  return (
    <>
      {messages.map((message) => {
        const text = getMessageText(message);
        const messageAttachments = getMessageAttachments(message);
        return (
          <Message key={message.id} from={message.role} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`flex gap-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* <div className={`w-10 h-10 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-2xl border ${message.role === 'user' ? 'bg-[#0A0A0A] border-white/10' : 'bg-primary/10 border-primary/20 shadow-primary/5'}`}>
                {message.role === 'user' ? <User size={18} className="text-white/80" /> : <Sparkles size={18} className="text-primary" />}
              </div> */}
              <div className={`flex-1 min-w-0 flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {message.role === 'assistant' && (
                  <Reasoning 
                    isStreaming={isLoading && messages[messages.length - 1].id === message.id}
                    className="w-full"
                  >
                    <ReasoningTrigger className="py-2 px-1 text-white/40 hover:text-white/60" />
                    <ReasoningContent className="py-4 px-1 text-white/50 leading-relaxed max-w-2xl">
                      {getMessageReasoning(message) || (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="size-1.5 bg-white/30 rounded-full shrink-0" />
                            <span className="text-xs">Generating response</span>
                          </div>
                          <div className="text-xs opacity-40 ml-4">
                            {isLoading && messages[messages.length - 1].id === message.id ? 'In progress' : 'Process completed'}
                          </div>
                        </div>
                      )}
                    </ReasoningContent>
                  </Reasoning>
                )}
                <MessageContent className={message.role === 'user' ? 'group-[.is-user]:bg-[#0A0A0A] group-[.is-user]:text-white/90 group-[.is-user]:rounded-2xl group-[.is-user]:border group-[.is-user]:border-white/5 group-[.is-user]:shadow-2xl' : 'text-white/80'}>
                  <MessageResponse isAnimating={isLoading && messages[messages.length-1].id === message.id} className="prose prose-invert prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-[#050505] prose-pre:border prose-pre:border-white/5">
                    {text}
                  </MessageResponse>
                  
                  {messageAttachments.length > 0 && (
                    <Attachments className="mt-6 flex flex-wrap gap-3">
                      {messageAttachments.map((attachment, index) => (
                        <Attachment key={`${message.id}-${index}`} data={{
                          id: `${message.id}-${index}`,
                          type: 'file',
                          filename: attachment.filename,
                          mediaType: attachment.mediaType,
                          url: attachment.url
                        }} className="rounded-xl border border-white/5 bg-white/5 p-1 hover:border-primary/30 transition-all">
                          <AttachmentPreview />
                        </Attachment>
                      ))}
                    </Attachments>
                  )}
                </MessageContent>
                
                <MessageToolbar className={cn(
                  "mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0",
                  message.role === 'user' && "justify-end"
                )}>
                  <MessageActions className="bg-[#080808] p-1 rounded-full border border-white/5 shadow-xl">
                    <MessageAction tooltip="Copy message" onClick={() => copyToClipboard(text)} className="hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer">
                      <Copy size={13} />
                    </MessageAction>
                    <MessageAction tooltip="Save to memory" onClick={() => onSaveMemory(text)} className="hover:text-indigo-300 hover:bg-indigo-500/10 rounded-full cursor-pointer">
                      <Brain size={13} />
                    </MessageAction>
                    {message.role === 'assistant' && (
                      <>
                        <MessageAction tooltip="Regenerate response" onClick={() => regenerate({ body: { model: selectedModel } })} className="hover:text-primary hover:bg-primary/10 rounded-full cursor-pointer">
                          <RotateCcw size={13} />
                        </MessageAction>
                        <div className="divider divider-horizontal mx-0 w-px opacity-10 py-1"></div>
                        <MessageAction tooltip="Positive feedback" className="hover:text-green-400 hover:bg-green-400/10 rounded-full cursor-pointer">
                          <ThumbsUp size={13} />
                        </MessageAction>
                        <MessageAction tooltip="Negative feedback" className="hover:text-red-400 hover:bg-red-400/10 rounded-full cursor-pointer">
                          <ThumbsDown size={13} />
                        </MessageAction>
                      </>
                    )}
                  </MessageActions>
                </MessageToolbar>
              </div>
            </div>
          </Message>
        );
      })}
      
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <Message from="assistant" className="animate-pulse">
           <div className="flex gap-6">
            <div className="w-10 h-10 rounded-[1.25rem] bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles size={18} className="text-primary/40 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2 text-primary/20 ml-1">
                Processing Cycle
              </div>
              <MessageContent className="italic text-white/30 text-sm font-light tracking-wide">
                Neural pathways routing...
              </MessageContent>
            </div>
          </div>
        </Message>
      )}
    </>
  );
}
