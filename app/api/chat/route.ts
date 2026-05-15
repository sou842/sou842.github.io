import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from 'ai';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import { formatMemoriesForPrompt } from '@/lib/memory-storage';
import mongoose from 'mongoose';
import { z } from 'zod';
import { getMessageText } from '@/lib/ai/message-utils';

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
  getWeather: tool({
    description: "Get current weather or forecast for a specific location. Use this when the user asks about weather, temperature, or conditions. If you don't have coordinates, providing a city name as 'location' is sufficient.",
    inputSchema: z.object({
      location: z.string().describe("City name (e.g., 'Bangalore', 'London')"),
      latitude: z.number().optional().describe("Latitude of the location"),
      longitude: z.number().optional().describe("Longitude of the location"),
    }),
    execute: async ({ location, latitude, longitude }) => {
      let lat = latitude;
      let lon = longitude;

      // 1. Geocoding if only location name is provided
      if (location && (lat === undefined || lon === undefined)) {
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
          const geoData = await geoRes.json();
          if (!geoData.results || geoData.results.length === 0) {
            return { error: `Could not find coordinates for "${location}"` };
          }
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        } catch (err) {
          return { error: "Geocoding service unavailable." };
        }
      }

      if (lat === undefined || lon === undefined) {
        return { error: "Missing location or coordinates." };
      }

      // 2. Fetch weather data
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        
        return {
          location: location || "the requested coordinates",
          latitude: lat,
          longitude: lon,
          current: weatherData.current_weather,
          daily: weatherData.daily,
          hourly: weatherData.hourly,
          units: weatherData.current_weather_units
        };
      } catch (err) {
        return { error: "Weather service unavailable." };
      }
    },
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
      "Tool & Memory policy:",
      "1. To remember information: call 'saveMemory' when explicitly asked to remember/memorize/store facts. Pick categories carefully.",
      "2. For weather: To get weather, you need coordinates. Search memories for the user's location/city. If not found, ask the user for their location. Once you have a city name or coordinates, call 'getWeather'.",
      memoryContext
        ? `Use these saved user memories when relevant. Do not mention them unless it helps the answer.\n${memoryContext}`
        : "",
    ].filter(Boolean).join("\n\n");

    const normalizedMessages = (messages || []).map((m: any) => ({
      ...m,
      parts: m.parts || [{ type: 'text', text: String(m.content || '') }]
    }));
    const modelMessages = await convertToModelMessages(normalizedMessages);

    const result = streamText({
      model: provider(model),
      messages: modelMessages.length > 0 ? modelMessages : [{ role: 'user', content: ' ' }],
      system: systemPrompt,
      tools,
      stopWhen: stepCountIs(2),
      onFinish: async ({ text, toolResults }) => {
        if (!canPersist) {
          return;
        }

        try {
          const dbMessages = (messages || []).map((m: any) => ({
            role: m.role,
            content: getMessageText(m as any).trim() || m.content || '',
            toolInvocations: m.toolInvocations || [],
          }));

          const assistantMessage = { 
            role: 'assistant', 
            content: text,
            toolInvocations: toolResults?.map(result => ({
              ...result,
              state: 'result' as const,
            })) || []
          };
          dbMessages.push(assistantMessage);

          if (validChatId) {
            await Chat.findByIdAndUpdate(validChatId, {
              $set: { messages: dbMessages },
              $setOnInsert: { title: `${dbMessages[0]?.content?.slice(0, 50) || 'New Chat'}...` }
            }, { upsert: true });
          } else {
            // Fallback for safety, though validChatId should be present
            await Chat.create({
              title: `${dbMessages[0]?.content?.slice(0, 50) || 'New Chat'}...`,
              messages: dbMessages,
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
