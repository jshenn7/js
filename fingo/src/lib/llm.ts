export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

function cloudProvider() {
  if (process.env.OPENAI_API_KEY) {
    return {
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    };
  }
  return null;
}

/**
 * One-shot (non-streaming) chat completion. Uses OpenAI/Groq when API keys
 * are configured (e.g. on serverless hosts), otherwise local Ollama.
 * Returns null on any failure so callers can fall back to heuristics.
 */
export async function chatOnce(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number; timeoutMs?: number },
): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? 30000;
  const provider = cloudProvider();

  try {
    if (provider) {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: options?.temperature ?? 0.5,
          max_tokens: options?.maxTokens ?? 200,
          messages,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content || null;
    }

    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        keep_alive: "24h",
        options: {
          temperature: options?.temperature ?? 0.5,
          num_predict: options?.maxTokens ?? 200,
        },
        messages,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content || null;
  } catch {
    return null;
  }
}
