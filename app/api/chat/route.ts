import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from 'ai';
import dbConnect from '@/lib/mongodb';
import Chat from '@/lib/models/Chat';
import { formatMemoriesForPrompt } from '@/lib/memory-storage';
import mongoose from 'mongoose';
import { z } from 'zod';
import Task from '@/lib/models/Task';
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
const taskStatusSchema = z.enum(['todo', 'in-progress', 'done', 'backlog']);
const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);


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
  getTime: tool({
    description: "Get current date and time for a specific location. Use this when the user asks for the time, date, or day of the week. Defaults to India if no location is specified.",
    inputSchema: z.object({
      location: z.string().default("India").describe("City or country name (e.g., 'London', 'USA', 'India')"),
    }),
    execute: async ({ location }) => {
      try {
        let timezone = "Asia/Kolkata"; // Default
        let resolvedLocation = "India";

        const aliases: Record<string, string> = {
          "bangalore": "Asia/Kolkata",
          "bengaluru": "Asia/Kolkata",
          "mumbai": "Asia/Kolkata",
          "bombay": "Asia/Kolkata",
          "delhi": "Asia/Kolkata",
          "new delhi": "Asia/Kolkata",
          "calcutta": "Asia/Kolkata",
          "kolkata": "Asia/Kolkata",
          "madras": "Asia/Kolkata",
          "chennai": "Asia/Kolkata",
          "pune": "Asia/Kolkata",
          "hyderabad": "Asia/Kolkata",
        };

        if (location && location.toLowerCase() !== "india") {
          const aliasTimezone = aliases[location.toLowerCase()];
          if (aliasTimezone) {
            timezone = aliasTimezone;
            resolvedLocation = location.charAt(0).toUpperCase() + location.slice(1);
          } else {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=10&language=en&format=json`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
              // Pick the most significant result (highest population or first major city)
              const bestMatch = geoData.results.sort((a: any, b: any) => (b.population || 0) - (a.population || 0))[0];
              timezone = bestMatch.timezone || "UTC";
              resolvedLocation = bestMatch.name + (bestMatch.country ? `, ${bestMatch.country}` : "");
            } else {
              return { error: `Could not find timezone for "${location}". Defaulting to India.` };
            }
          }
        }



        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const formatted = formatter.format(now);
        
        return {
          location: resolvedLocation,
          timezone: timezone,
          formatted: formatted,
          timestamp: now.toISOString()
        };
      } catch (err) {
        return { error: "Time service unavailable." };
      }
    },
  }),

  listTasks: tool({
    description: "List the user's tasks from their task manager. Can filter by status or priority. Use this when the user asks about their tasks, what they need to do, or wants a summary of their work.",
    inputSchema: z.object({
      status: taskStatusSchema.optional().describe('Filter by status (todo, in-progress, done, backlog)'),
      priority: taskPrioritySchema.optional().describe('Filter by priority (low, medium, high, urgent)'),
    }),
    execute: async ({ status, priority }) => {
      try {
        await dbConnect();
        const filter: any = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        const tasks = await Task.find(filter).sort({ updatedAt: -1 }).limit(50);
        return { success: true, tasks: JSON.parse(JSON.stringify(tasks)) };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  createTask: tool({
    description: "Create a new task in the user's task manager.",
    inputSchema: z.object({
      title: z.string().min(1).max(100).describe('Short title of the task'),
      description: z.string().max(1000).optional().describe('Detailed description of what needs to be done'),
      status: taskStatusSchema.default('todo').describe('Initial status of the task'),
      priority: taskPrioritySchema.default('medium').describe('Priority level'),
      dueDate: z.string().optional().describe('Due date in ISO string format or YYYY-MM-DD'),
      tags: z.array(z.string()).default([]).describe('Optional tags for categorization'),
    }),
    execute: async (data) => {
      try {
        await dbConnect();
        const task = await Task.create(data);
        return { success: true, task: JSON.parse(JSON.stringify(task)) };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  updateTask: tool({
    description: "Update an existing task's details, status, or priority. You must have the task ID (usually found via listTasks).",
    inputSchema: z.object({
      id: z.string().describe('The MongoDB ID of the task to update'),
      title: z.string().optional().describe('New title for the task'),
      description: z.string().optional().describe('New description'),
      status: taskStatusSchema.optional().describe('New status'),
      priority: taskPrioritySchema.optional().describe('New priority level'),
      dueDate: z.string().optional().describe('New due date'),
      tags: z.array(z.string()).optional().describe('Updated tags'),
    }),
    execute: async ({ id, ...updateData }) => {
      try {
        await dbConnect();
        const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
        if (!task) return { success: false, error: "Task not found" };
        return { success: true, task: JSON.parse(JSON.stringify(task)) };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  deleteTask: tool({
    description: "Delete a task from the task manager. Use with caution. Always confirm with the user first.",
    inputSchema: z.object({
      id: z.string().describe('The MongoDB ID of the task to delete'),
    }),
    execute: async ({ id }) => {
      try {
        await dbConnect();
        const result = await Task.deleteOne({ _id: id });
        if (result.deletedCount === 0) return { success: false, error: "Task not found" };
        return { success: true, message: "Task deleted successfully" };
      } catch (error: any) {
        return { success: false, error: error.message };
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
      "3. For tasks: You can manage the user's tasks. Use 'listTasks' to see what's on their plate, 'createTask' to add new ones, 'updateTask' to change details or status, and 'deleteTask' to remove them. Always confirm with the user before deleting.",
      "4. For date & time: Use 'getTime' to get the current date or time for any location. Default is India. If the user asks for the current time or date without specifying a city, call 'getTime' with no arguments. Be specific with city names (e.g., 'London, UK') to avoid ambiguity.",
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
