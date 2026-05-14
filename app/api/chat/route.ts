import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
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
  messages: z.array(z.custom<UIMessage>()).min(1),
});

const ALLOWED_MODELS = new Set([
  'mistral-large-latest',
  'mistral-small-latest',
  'codestral-latest',
  'deepseek-reasoner',
]);

export async function POST(req: Request) {
  try {
    const parsed = chatRequestSchema.safeParse(await req.json());

    if (!parsed.success) {
      return new Response('Invalid request payload', { status: 400 });
    }

    const { messages, chatId, model: requestedModel } = parsed.data;

    const validChatId =
      chatId && mongoose.Types.ObjectId.isValid(chatId) ? chatId : undefined;

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

    const result = streamText({
      model: provider(model),
      messages: await convertToModelMessages(messages),
      system: "You are Jarvis, a helpful and sophisticated AI assistant. You are polite, efficient, and have a slight British flair, similar to Tony Stark's assistant. You help users with coding, analysis, and general tasks.",
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
            });
          } else {
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
