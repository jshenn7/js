import { NextResponse } from "next/server";
import { buildCoachSystemPrompt, type ChatMessage } from "@/lib/coach-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  messages?: Array<{ role: "user" | "coach" | "assistant"; content?: string; text?: string }>;
};

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

function normalizeMessages(body: Body): ChatMessage[] {
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  return incoming
    .map((m) => {
      const content = (m.content ?? m.text ?? "").trim();
      if (!content) return null;
      const role = m.role === "user" ? "user" : "assistant";
      return { role, content } as ChatMessage;
    })
    .filter((m): m is ChatMessage => Boolean(m))
    .slice(-16);
}

async function streamFromOllama(messages: ChatMessage[]) {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      options: {
        temperature: 0.6,
        num_predict: 450,
      },
      messages: [{ role: "system", content: buildCoachSystemPrompt() }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed) as {
                message?: { content?: string };
                done?: boolean;
              };
              const chunk = json.message?.content || "";
              if (chunk) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
                );
              }
              if (json.done) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            } catch {
              // ignore partial JSON lines
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function streamFromOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.6,
      messages: [{ role: "system", content: buildCoachSystemPrompt() }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Provider error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const json = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const chunk = json.choices?.[0]?.delta?.content || "";
              if (chunk) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
                );
              }
            } catch {
              // ignore
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function createReplyStream(messages: ChatMessage[]) {
  if (process.env.OPENAI_API_KEY) {
    return streamFromOpenAICompatible(
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
    );
  }
  if (process.env.GROQ_API_KEY) {
    return streamFromOpenAICompatible(
      "https://api.groq.com/openai/v1",
      process.env.GROQ_API_KEY,
      process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
    );
  }

  // Default: local Ollama
  return streamFromOllama(messages);
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = normalizeMessages(body);
  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Send at least one user message." }, { status: 400 });
  }

  try {
    const stream = await createReplyStream(messages);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coach unavailable.";
    return NextResponse.json(
      {
        error:
          "AI Coach could not reach a model. Make sure Ollama is running (`ollama serve`) or set OPENAI_API_KEY / GROQ_API_KEY.",
        detail: message,
      },
      { status: 502 },
    );
  }
}
