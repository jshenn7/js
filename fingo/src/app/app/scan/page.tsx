"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImagePlus, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { Panel, SectionHeader } from "@/components/ui";
import { formatMoney } from "@/lib/data";
import {
  categoryOptions,
  type CategoryId,
  type ReceiptParseResult,
} from "@/lib/spending";
import { useSpending } from "@/lib/spending-store";

type Draft = {
  merchant: string;
  amount: string;
  categoryId: CategoryId;
  date: string;
  note: string;
};

export default function ScanPage() {
  const { addReceipt, transactions, categories } = useSpending();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confidence, setConfidence] = useState<ReceiptParseResult["confidence"] | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo of your receipt.");
      return;
    }

    setError(null);
    setDraft(null);
    setConfidence(null);

    const dataUrl = await readFileAsDataUrl(file);
    const compressed = await compressImage(dataUrl, 1600);
    setPreview(compressed);
    await scanImage(compressed);
  }

  async function scanImage(dataUrl: string) {
    setBusy(true);
    setError(null);
    try {
      // The server OCRs the photo with native Tesseract. If that endpoint
      // reports OCR is unavailable, fall back to in-browser OCR.
      let res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      let data = (await res.json()) as {
        error?: string;
        needClientOcr?: boolean;
        result?: ReceiptParseResult;
      };

      if (res.status === 501 && data.needClientOcr) {
        const { ocrReceiptImage } = await import("@/lib/receipt-ocr");
        const ocrText = await ocrReceiptImage(dataUrl);
        if (!ocrText) {
          throw new Error("Couldn’t read text from that photo. Try better lighting.");
        }
        res = await fetch("/api/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ocrText }),
        });
        data = (await res.json()) as typeof data;
      }
      if (!res.ok || !data.result) {
        if (data.result) {
          setDraft({
            merchant: data.result.merchant,
            amount: data.result.amount ? String(data.result.amount) : "",
            categoryId: data.result.categoryId,
            date: data.result.date,
            note: data.result.note || "",
          });
          setConfidence(data.result.confidence);
        }
        throw new Error(data.error || "Could not read that receipt.");
      }

      setDraft({
        merchant: data.result.merchant,
        amount: String(data.result.amount),
        categoryId: data.result.categoryId,
        date: data.result.date,
        note: data.result.note || "",
      });
      setConfidence(data.result.confidence);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  function applyReceipt() {
    if (!draft) return;
    const amount = Number(draft.amount);
    if (!draft.merchant.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a merchant and a valid amount before saving.");
      return;
    }
    const tx = addReceipt({
      merchant: draft.merchant,
      amount,
      categoryId: draft.categoryId,
      date: draft.date,
      note: draft.note || undefined,
    });
    setToast(`Added ${formatMoney(tx.amount)} to ${tx.categoryId}.`);
    setDraft(null);
    setPreview(null);
    setConfidence(null);
    setError(null);
  }

  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Scan receipt
          </h1>
          <p className="mt-1 text-sm text-muted">
            Snap a photo — FinGo reads the total and updates your spending
          </p>
        </div>
        {toast ? (
          <div className="animate-streak rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lift">
            {toast}
          </div>
        ) : null}
      </div>

      <Panel className="animate-rise-delay-1">
        <SectionHeader
          title="Camera / upload"
          subtitle="Use your phone camera or pick a receipt photo from your gallery"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
              <Sparkles className="h-3.5 w-3.5" />
              Vision AI
            </span>
          }
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0] || null)}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0] || null)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="tactile flex min-h-36 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed border-primary/40 bg-primary-soft/40 px-4 py-6 text-center disabled:opacity-60"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-soft">
              <Camera className="h-6 w-6" />
            </span>
            <span className="font-bold text-ink">Take photo</span>
            <span className="text-xs text-muted">Opens camera on mobile</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
            className="tactile flex min-h-36 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-line bg-bg/50 px-4 py-6 text-center disabled:opacity-60"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-primary shadow-soft ring-1 ring-line">
              <ImagePlus className="h-6 w-6" />
            </span>
            <span className="font-bold text-ink">Upload photo</span>
            <span className="text-xs text-muted">Choose from gallery</span>
          </button>
        </div>

        {preview ? (
          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-line bg-bg/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Receipt preview" className="max-h-72 w-full object-contain" />
          </div>
        ) : null}

        {busy ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Reading receipt…
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </Panel>

      {draft ? (
        <Panel className="animate-rise-delay-2">
          <SectionHeader
            title="Confirm details"
            subtitle="Edit anything that looks off, then add it to your budget"
            action={
              confidence ? (
                <span className="rounded-full bg-sun-soft px-3 py-1 text-xs font-bold text-[#8a6a00]">
                  {confidence} confidence
                </span>
              ) : null
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink-soft">Merchant</span>
              <input
                value={draft.merchant}
                onChange={(e) => setDraft({ ...draft, merchant: e.target.value })}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-soft">Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-soft">Category</span>
              <select
                value={draft.categoryId}
                onChange={(e) =>
                  setDraft({ ...draft, categoryId: e.target.value as CategoryId })
                }
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
              >
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-soft">Date</span>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink-soft">Note</span>
              <input
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
                placeholder="Optional items summary"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyReceipt}
              className="tactile inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white"
            >
              <Check className="h-4 w-4" />
              Add to spending
            </button>
            {preview ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void scanImage(preview)}
                className="tactile inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink"
              >
                <RefreshCw className="h-4 w-4" />
                Rescan
              </button>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Recent receipt updates"
          subtitle="These totals feed your Home pie chart and category budgets"
        />
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No scanned receipts yet. Take a photo to start.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-bg/40 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-ink">{tx.merchant}</p>
                    <p className="text-xs text-muted">
                      {tx.date} · {cat?.name || tx.categoryId}
                      {tx.note ? ` · ${tx.note}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-primary-deep">
                    {formatMoney(tx.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

async function compressImage(dataUrl: string, maxWidth: number) {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / img.width);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}
