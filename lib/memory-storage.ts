export const MEMORY_STORAGE_KEY = "jarvis-memory-v1";

export type MemoryCategory = "profile" | "preference" | "project" | "fact" | "instruction";

export type MemorySource = "manual" | "chat";

export type MemoryItem = {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  source: MemorySource;
  tags: string[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MemoryCapture = {
  content: string;
  category: MemoryCategory;
  tags: string[];
  title?: string;
};

export const memoryCategories: Array<{ id: MemoryCategory; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "preference", label: "Preference" },
  { id: "project", label: "Project" },
  { id: "fact", label: "Fact" },
  { id: "instruction", label: "Instruction" },
];

export const loadMemories = (): MemoryItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MemoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveMemories = (memories: MemoryItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  window.dispatchEvent(new CustomEvent("jarvis-memory-updated", { detail: memories }));
};

export const summarizeMemoryTitle = (content: string) => {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "Untitled memory";
  }

  return normalized.length > 58 ? `${normalized.slice(0, 55)}...` : normalized;
};

export const parseMemoryTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

export const createMemoryItem = ({
  title,
  content,
  category,
  source = "manual",
  tags = [],
  enabled = true,
}: {
  title?: string;
  content: string;
  category?: MemoryCategory;
  source?: MemorySource;
  tags?: string[];
  enabled?: boolean;
}): MemoryItem => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title: title?.trim() || summarizeMemoryTitle(content),
    content: content.trim(),
    category: category ?? inferMemoryCategory(content),
    source,
    tags,
    enabled,
    createdAt: now,
    updatedAt: now,
  };
};

export const addMemory = (item: Omit<Parameters<typeof createMemoryItem>[0], "enabled"> & { enabled?: boolean }) => {
  const next = [createMemoryItem(item), ...loadMemories()];
  saveMemories(next);
  return next[0];
};

const cleanCapturedMemory = (value: string) =>
  value
    .replace(/^[\s"']+|[\s"'.!?]+$/g, "")
    .replace(/^(?:that|this|it)\s+/i, "")
    .trim();

const normalizeMemoryCommand = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[`"“”'‘’]+|[`"“”'‘’]+$/g, "")
    .trim();

const categoryRules: Record<MemoryCategory, RegExp[]> = {
  instruction: [
    /\b(always|never|from now on|going forward|by default)\b/,
    /\b(when you|whenever you|if i ask|respond|answer|format|use bullet|be concise|keep it short)\b/,
    /\b(do not|don't|avoid|make sure you|remember to)\b/,
  ],
  preference: [
    /\b(i prefer|i like|i dislike|i love|i hate|my preference|my preferred)\b/,
    /\b(favorite|favourite|i usually|i tend to|i would rather|i want)\b/,
    /\b(prefer .* over|use .* instead of)\b/,
  ],
  project: [
    /\b(my|our|the)\s+(project|repo|repository|app|application|website|codebase|product|platform)\b/,
    /\b(tech stack|stack is|frontend|backend|database|api|deployment|hosting|domain)\b/,
    /\b(next\.?js|react|typescript|mongodb|mongoose|tailwind|vercel|node\.?js|express)\b/,
  ],
  profile: [
    /\b(my name is|i am|i'm|call me|you can call me)\b/,
    /\b(my role is|i work as|i work at|i live in|i am from|my timezone is)\b/,
    /\b(my email is|my phone|my birthday|my birthday is|my location is)\b/,
  ],
  fact: [
    /\b(deadline|meeting|appointment|reminder|important|fact|note)\b/,
  ],
};

export const inferMemoryCategory = (content: string): MemoryCategory => {
  const normalized = content.toLowerCase();
  const scores = Object.fromEntries(
    memoryCategories.map(({ id }) => [id, 0])
  ) as Record<MemoryCategory, number>;

  for (const [category, rules] of Object.entries(categoryRules) as Array<[MemoryCategory, RegExp[]]>) {
    for (const rule of rules) {
      if (rule.test(normalized)) {
        scores[category] += 1;
      }
    }
  }

  if (/\b(i want you to|please always|please never)\b/.test(normalized)) {
    scores.instruction += 2;
  }

  if (/\b(my name is|call me|my email is|my phone|my birthday)\b/.test(normalized)) {
    scores.profile += 2;
  }

  if (/\b(i prefer|my preferred|favorite|favourite)\b/.test(normalized)) {
    scores.preference += 2;
  }

  if (/\b(my|our)\s+(project|repo|repository|app|codebase)\b/.test(normalized)) {
    scores.project += 2;
  }

  const priority: MemoryCategory[] = ["instruction", "profile", "preference", "project", "fact"];
  return priority.reduce<MemoryCategory>(
    (best, category) => (scores[category] > scores[best] ? category : best),
    "fact"
  );
};

export const extractMemoryCapture = (text: string): MemoryCapture | null => {
  const normalized = normalizeMemoryCommand(text);
  if (!normalized) {
    return null;
  }

  const patterns = [
    /^(?:please\s+)?(?:remember|memorize|memorise|store|save|note)\s+(?:this|that|it)?\s*(?:in memory|to memory|as memory)?\s*[:,-]?\s*(.+)$/i,
    /^(?:please\s+)?(?:remember|memorize|memorise)\s+that\s+(.+)$/i,
    /^(?:please\s+)?(?:keep|add)\s+(.+?)\s+(?:in|to)\s+(?:your\s+)?memory$/i,
  ];

  const match = patterns.map((pattern) => normalized.match(pattern)).find(Boolean);
  if (!match?.[1]) {
    return null;
  }

  const content = cleanCapturedMemory(match[1]);
  if (content.length < 2) {
    return null;
  }

  const category = inferMemoryCategory(content);
  return {
    content,
    category,
    tags: ["chat", "auto"],
    title: summarizeMemoryTitle(content),
  };
};

export const getEnabledMemoriesForPrompt = () =>
  loadMemories()
    .filter((memory) => memory.enabled && memory.content.trim())
    .slice(0, 24)
    .map(({ title, content, category, tags }) => ({ title, content, category, tags }));

export const formatMemoriesForPrompt = (
  memories: Array<{ title: string; content: string; category: string; tags: string[] }>
) => {
  if (!memories.length) {
    return "";
  }

  return memories
    .map((memory, index) => {
      const tags = memory.tags.length ? ` Tags: ${memory.tags.join(", ")}.` : "";
      return `${index + 1}. [${memory.category}] ${memory.title}: ${memory.content}${tags}`;
    })
    .join("\n");
};
