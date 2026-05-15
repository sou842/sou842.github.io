import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from 'ai';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import { formatMemoriesForPrompt } from '@/lib/memory-storage';
import mongoose from 'mongoose';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: process.env.MISTRAL_BASE_URL,
});

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const chatRequestSchema = z.object({
  chatId: z.string().optional(),
  model: z.string().optional(),
  memories: z.array(z.object({
    title: z.string(),
    content: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
  })).optional(),
  messages: z.array(z.custom<UIMessage>()).min(1),
});

const ALLOWED_MODELS = new Set([
  'mistral-small-latest',
  'mistral-large-latest',
  'codestral-latest',
  'deepseek-reasoner',
]);

const memoryCategorySchema = z.enum(['profile', 'preference', 'project', 'fact', 'instruction']);

const tools = {
  saveMemory: tool({
    description:
      "Save durable user memory when the user explicitly asks you to remember, memorize, store, save, or note something for future chats. Choose the most accurate category. Do not call this for ordinary facts unless the user asks you to remember them.",
    inputSchema: z.object({
      title: z.string().min(2).max(80).describe('Short human-readable label for the memory.'),
      content: z.string().min(2).max(1000).describe('The exact useful memory to save, without the command words.'),
      category: memoryCategorySchema.describe('The best category for this memory.'),
      tags: z.array(z.string().min(1).max(24)).max(8).default([]).describe('Short lowercase tags.'),
    }),
    execute: async ({ title, content, category, tags }) => ({
      action: 'save_memory' as const,
      memory: {
        title,
        content,
        category,
        tags,
      },
      status: 'ready_for_client_persist' as const,
    }),
  }),
};

export async function POST(req: Request) {
  try {
    const parsed = chatRequestSchema.safeParse(await req.json());

    if (!parsed.success) {
      return new Response('Invalid request payload', { status: 400 });
    }

    const { messages, chatId, memories = [], model: requestedModel } = parsed.data;

    const validChatId = chatId;

    const model = requestedModel && ALLOWED_MODELS.has(requestedModel)
      ? requestedModel
      : 'mistral-large-latest';

    const provider = model === 'deepseek-reasoner' ? deepseek : mistral;

    let canPersist = false;
    try {
      await dbConnect();
      canPersist = true;
    } catch (dbConnectError) {
      console.warn('MongoDB unavailable, continuing without persistence:', dbConnectError);
    }

    const memoryContext = formatMemoriesForPrompt(memories);
    const systemPrompt = [
      "You are Jarvis, a helpful and sophisticated AI assistant. You are polite, efficient, and have a slight British flair, similar to Tony Stark's assistant. You help users with coding, analysis, and general tasks.",
      "Tool policy: when the user explicitly asks you to remember, memorize, store, save, or note information for future chats, call the saveMemory tool with the cleaned memory. Pick category carefully: profile is identity/contact/role/location, preference is likes/default preferences, project is project/codebase/stack/product info, instruction is future behavior rules, fact is everything else. After the tool succeeds, briefly confirm what was saved.",
      memoryContext
        ? `Use these saved user memories when relevant. Do not mention them unless it helps the answer.\n${memoryContext}`
        : "",
    ].filter(Boolean).join("\n\n");

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: provider(model),
      messages: modelMessages.length > 0 ? modelMessages : [{ role: 'user', content: ' ' }],
      system: systemPrompt,
      tools,
      stopWhen: stepCountIs(2),
      onFinish: async ({ text }) => {
        if (!canPersist) {
          return;
        }

        try {
          const lastUserMessage = [...messages]
            .reverse()
            .find((message) => message.role === 'user');
          const userText = lastUserMessage?.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')
            .trim();

          if (!userText) {
            return;
          }

          const userMessage = { role: 'user', content: userText };
          const assistantMessage = { role: 'assistant', content: text };

          if (validChatId) {
            await Chat.findByIdAndUpdate(validChatId, {
              $push: { messages: [userMessage, assistantMessage] },
              $setOnInsert: { title: `${userMessage.content.slice(0, 50)}...` }
            }, { upsert: true });
          } else {
            // Fallback for safety, though validChatId should be present
            await Chat.create({
              title: `${userMessage.content.slice(0, 50)}...`,
              messages: [userMessage, assistantMessage],
            });
          }
        } catch (dbError) {
          console.error('Failed to persist chat to MongoDB:', dbError);
          // We don't throw here as the stream response is already being handled
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('An unexpected error occurred', { status: 500 });
  }
}
