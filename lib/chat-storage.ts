import type { UIMessage } from "ai";
import { getMessageText } from "@/lib/ai/message-utils";

export const CHAT_STORAGE_KEY = "jarvis-chat-history-v1";

export type StoredChat = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

export const deriveChatTitle = (messages: UIMessage[]) => {
  const firstUser = messages.find((message) => message.role === "user");
  const text = firstUser ? getMessageText(firstUser).trim() : "";
  return text ? text.slice(0, 44) : "New Chat";
};

export const createEmptyChat = (): StoredChat => ({
  id: crypto.randomUUID(),
  messages: [],
  title: "New Chat",
  updatedAt: Date.now(),
});

export const loadStoredChats = (): StoredChat[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredChat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredChats = (chats: StoredChat[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
};
