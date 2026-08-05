import { NextResponse } from "next/server";
import { buildCoachSystemPrompt } from "@/lib/coach-context";
import { tipOfDay } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

type SpendingSnapshot = {
  categories?: Array<{ name?: string; spent?: number; budget?: number }>;
  recent?: Array<{ merchant?: string; amount?: number; date?: string }>;
};

type Tip = { title: string; body: string; source: "ai" | "static" };

// One LLM call per hour per spending snapshot is plenty for a daily tip.
let cached: { key: string; tip: Tip; at: number } | null = null;
const CACHE_MS = 60 * 60 * 1000;

function snapshotKey(snapshot: SpendingSnapshot) {
  const day = new Date().toISOString().slice(0, 10);
  const spent = (snapshot.categories || [])
    .map((c) => Math.round(c.spent || 0))
    .join(",");
  return `${day}|${spent}`;
}

function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || text).trim();
  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through to brace matching
  }
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function describeSnapshot(snapshot: SpendingSnapshot) {
  const cats = (snapshot.categories || [])
    .filter((c) => c.name)
    .map(
      (c) =>
        `- ${c.name}: spent $${Math.round(c.spent || 0)} of $${Math.round(c.budget || 0)}`,
    )
    .join("\n");
  const recent = (snapshot.recent || [])
    .filter((t) => t.merchant)
    .slice(0, 5)
    .map((t) => `- ${t.merchant}: $${(t.amount || 0).toFixed(2)} on ${t.date || "?"}`)
    .join("\n");
  return [
    cats ? `LIVE CATEGORY SPENDING (includes scanned receipts)\n${cats}` : "",
    recent ? `MOST RECENT RECEIPTS\n${recent}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function generateTip(snapshot: SpendingSnapshot): Promise<Tip | null> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        options: { temperature: 0.7, num_predict: 120 },
        messages: [
          {
            role: "system",
            content: `${buildCoachSystemPrompt()}\n\nTask: write today's Tip of the Day for the home screen. One specific, actionable tip grounded in the numbers above (use dollar amounts). Reply with ONLY compact JSON: {"title": string (max 5 words), "body": string (one sentence, max 30 words)}.`,
          },
          {
            role: "user",
            content: `Latest live data from my device:\n\n${describeSnapshot(snapshot) || "(no live data yet — use the monthly snapshot)"}\n\nGive me today's tip.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    const json = extractJson(data.message?.content || "");
    if (!json) return null;
    const title = String(json.title || "").trim();
    const body = String(json.body || "").trim();
    if (!body) return null;
    return {
      title: title.slice(0, 48) || "Coach tip",
      body: body.slice(0, 220),
      source: "ai",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let snapshot: SpendingSnapshot = {};
  try {
    snapshot = (await request.json()) as SpendingSnapshot;
  } catch {
    // proceed with empty snapshot
  }

  const key = snapshotKey(snapshot);
  if (cached && cached.key === key && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ tip: cached.tip });
  }

  const tip = await generateTip(snapshot);
  if (tip) {
    cached = { key, tip, at: Date.now() };
    return NextResponse.json({ tip });
  }

  return NextResponse.json({
    tip: { title: tipOfDay.title, body: tipOfDay.body, source: "static" } satisfies Tip,
  });
}
