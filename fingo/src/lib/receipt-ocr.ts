"use client";

import Tesseract from "tesseract.js";

export async function ocrReceiptImage(dataUrl: string) {
  const {
    data: { text },
  } = await Tesseract.recognize(dataUrl, "eng", {
    logger: () => undefined,
  });
  return (text || "").trim();
}
