import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import {
  categoryOptions,
  guessCategory,
  type CategoryId,
  type ReceiptParseResult,
} from "@/lib/spending";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const TEXT_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

const execFileAsync = promisify(execFile);

type Body = {
  ocrText?: string;
  imageBase64?: string;
};

function decodeImage(imageBase64: string): { buffer: Buffer; ext: string } | null {
  const match = imageBase64.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  const ext = match ? (match[1].toLowerCase() === "png" ? "png" : "jpg") : "jpg";
  const payload = match ? match[2] : imageBase64;
  try {
    const buffer = Buffer.from(payload, "base64");
    if (buffer.length < 100) return null;
    return { buffer, ext };
  } catch {
    return null;
  }
}

async function runTesseract(file: string, psm: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "tesseract",
    [file, "stdout", "-l", "eng", "--psm", psm],
    {
      timeout: 15000,
      maxBuffer: 4 * 1024 * 1024,
      // Tesseract's OpenMP threads busy-wait and can spin forever when
      // spawned from the server under CPU contention; single-threaded OCR
      // finishes in well under a second.
      env: { ...process.env, OMP_THREAD_LIMIT: "1" },
    },
  );
  return (stdout || "").trim();
}

function usefulChars(text: string) {
  return (text.match(/[a-z0-9]/gi) || []).length;
}

/**
 * OCR the image with the native tesseract binary. Returns null when the
 * binary is not installed so the client can fall back to in-browser OCR.
 */
async function ocrImageOnServer(imageBase64: string): Promise<string | null> {
  const decoded = decodeImage(imageBase64);
  if (!decoded) return "";

  const dir = await mkdtemp(join(tmpdir(), "fingo-receipt-"));
  const file = join(dir, `receipt.${decoded.ext}`);
  try {
    await writeFile(file, decoded.buffer);
    // PSM 6 (uniform block) fits most receipts; PSM 4 (single column)
    // catches layouts PSM 6 misses. Run sequentially and keep the richer read.
    const texts: string[] = [];
    for (const psm of ["6", "4"]) {
      try {
        texts.push(await runTesseract(file, psm));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      }
    }
    if (texts.length === 0) return "";
    return texts.sort((a, b) => usefulChars(b) - usefulChars(a))[0] || "";
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || text).trim();
  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === "object") {
      return parsed[0] as Record<string, unknown>;
    }
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
  } catch {
    // continue
  }

  const startObj = candidate.indexOf("{");
  const endObj = candidate.lastIndexOf("}");
  if (startObj >= 0 && endObj > startObj) {
    try {
      return JSON.parse(candidate.slice(startObj, endObj + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function pick(raw: Record<string, unknown>, keys: string[]) {
  const entries = Object.entries(raw);
  for (const key of keys) {
    const hit = entries.find(([k]) => k.trim().toLowerCase() === key.toLowerCase());
    if (hit && hit[1] != null && hit[1] !== "") return hit[1];
  }
  return undefined;
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d{1,2})?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function amountsFromText(text: string): number[] {
  const matches = [...text.matchAll(/\$?\s*(\d{1,5}\.\d{2})/g)];
  return matches
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 100000);
}

export function heuristicFromText(text: string): ReceiptParseResult {
  const totalMatch =
    text.match(
      /(?:grand\s*)?total(?:\s*due)?[^\d$]{0,20}\$?\s*(\d{1,5}\.\d{2})/i,
    ) ||
    text.match(/(?:amount\s*due|balance\s*due)[^\d$]{0,20}\$?\s*(\d{1,5}\.\d{2})/i);

  const amounts = amountsFromText(text);
  const amount = totalMatch
    ? Number(totalMatch[1])
    : amounts.length
      ? Math.max(...amounts)
      : 0;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const merchant =
    lines.find(
      (l) =>
        l.length > 2 &&
        l.length < 40 &&
        !/total|tax|subtotal|thank|visa|mastercard|change|cash|receipt/i.test(l) &&
        !/^\d/.test(l),
    ) || "Receipt";

  const categoryId = guessCategory(merchant, text);
  return {
    merchant: merchant.slice(0, 48),
    amount: Math.round(Math.abs(amount) * 100) / 100,
    date: new Date().toISOString().slice(0, 10),
    categoryId,
    categoryName: categoryOptions.find((c) => c.id === categoryId)?.name || "Food",
    confidence: amount > 0 ? "medium" : "low",
    rawText: text.slice(0, 1000),
  };
}

function normalizeResult(raw: Record<string, unknown>, fallbackText: string): ReceiptParseResult {
  const merchant =
    String(pick(raw, ["merchant", "store", "vendor", "name"]) || "Receipt").trim() ||
    "Receipt";
  let amount = parseAmount(pick(raw, ["amount", "total", "grand_total", "grand total"])) ?? 0;
  if (!amount) amount = heuristicFromText(fallbackText).amount;

  const dateRaw = String(pick(raw, ["date"]) || "").trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
    ? dateRaw
    : new Date().toISOString().slice(0, 10);
  const rawCategory = String(pick(raw, ["category", "categoryId", "subcategory"]) || "");
  const categoryId = categoryOptions.some((c) => c.id === rawCategory.toLowerCase())
    ? (rawCategory.toLowerCase() as CategoryId)
    : guessCategory(merchant, `${rawCategory} ${fallbackText}`);
  const note = String(pick(raw, ["note", "notes", "items"]) || "").trim();

  return {
    merchant: merchant.slice(0, 48),
    amount: Math.round(Math.abs(amount) * 100) / 100,
    date,
    categoryId,
    categoryName: categoryOptions.find((c) => c.id === categoryId)?.name || "Food",
    confidence: amount > 0 ? (merchant !== "Receipt" ? "high" : "medium") : "low",
    rawText: fallbackText.slice(0, 1000),
    note: note.slice(0, 160) || undefined,
  };
}

async function structureWithLlm(ocrText: string): Promise<ReceiptParseResult | null> {
  if (!ocrText.trim()) return null;
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TEXT_MODEL,
        stream: false,
        keep_alive: "24h",
        options: { temperature: 0.1, num_predict: 180 },
        messages: [
          {
            role: "system",
            content:
              "Extract receipt fields. Reply with ONLY compact JSON keys: merchant, amount (number), date (YYYY-MM-DD or empty), category (food|transport|leisure|subscriptions|health|housing), note.",
          },
          {
            role: "user",
            content: `OCR text from a receipt:\n\n${ocrText.slice(0, 1800)}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content || "";
    const json = extractJson(content);
    if (!json) return null;
    return normalizeResult(json, ocrText);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let ocrText = (body.ocrText || "").trim();

  if (!ocrText && body.imageBase64) {
    const serverText = await ocrImageOnServer(body.imageBase64);
    if (serverText === null) {
      return NextResponse.json(
        {
          error: "Server OCR is unavailable.",
          needClientOcr: true,
        },
        { status: 501 },
      );
    }
    ocrText = serverText.trim();
    if (usefulChars(ocrText) < 8) {
      return NextResponse.json(
        {
          error:
            "Couldn’t read text from that photo. Fill the frame with the receipt, keep it flat, and use good lighting.",
        },
        { status: 422 },
      );
    }
  }

  if (!ocrText) {
    return NextResponse.json(
      {
        error:
          "No receipt text was provided. Take/upload a clearer photo so OCR can read it.",
      },
      { status: 400 },
    );
  }

  try {
    const llmResult = await structureWithLlm(ocrText);
    const result = llmResult || heuristicFromText(ocrText);

    if (!result.amount || result.amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Couldn’t find a total on that receipt. Try a clearer photo or enter it manually.",
          result: { ...result, amount: 0 },
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt scan failed.";
    return NextResponse.json(
      { error: "Receipt scanner failed while reading the photo.", detail: message },
      { status: 502 },
    );
  }
}
