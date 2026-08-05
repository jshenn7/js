import { guessCategory, type CategoryId } from "@/lib/spending";

export type CsvRowDraft = {
  id: string;
  merchant: string;
  amount: number;
  categoryId: CategoryId;
  date: string;
  note?: string;
};

const DATE_HEADERS = ["date", "transaction date", "posted", "posting date", "trans date", "timestamp", "time"];
const AMOUNT_HEADERS = ["amount", "debit", "value", "sum", "total", "transaction amount", "spend"];
const CREDIT_HEADERS = ["credit"];
const MERCHANT_HEADERS = [
  "merchant",
  "description",
  "name",
  "payee",
  "vendor",
  "memo",
  "details",
  "narrative",
  "transaction",
];
const CATEGORY_HEADERS = ["category", "type", "labels", "tag"];

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      if (ch === "\r") i += 1;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

function findColumn(headers: string[], candidates: string[]) {
  for (let i = 0; i < headers.length; i++) {
    if (candidates.includes(headers[i])) return i;
  }
  // partial match fallback
  for (let i = 0; i < headers.length; i++) {
    if (candidates.some((c) => headers[i].includes(c) || c.includes(headers[i]))) return i;
  }
  return -1;
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num === 0) return null;
  return Math.round(Math.abs(num) * 100) / 100;
}

function parseDate(raw: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!raw) return today;
  const trimmed = raw.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const iso = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  // MM/DD/YYYY or M/D/YY
  const us = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (us) {
    const year = us[3].length === 2 ? `20${us[3]}` : us[3];
    return `${year}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return today;
}

export function parseTransactionsCsv(text: string): {
  rows: CsvRowDraft[];
  error?: string;
  detected: { date: string; amount: string; merchant: string; category?: string };
} {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return { rows: [], error: "That CSV file is empty.", detected: { date: "", amount: "", merchant: "" } };

  const table = parseCsvText(cleaned);
  if (table.length < 2) {
    return {
      rows: [],
      error: "CSV needs a header row and at least one transaction.",
      detected: { date: "", amount: "", merchant: "" },
    };
  }

  const headers = table[0].map(normalizeHeader);
  const dateIdx = findColumn(headers, DATE_HEADERS);
  const amountIdx = findColumn(headers, AMOUNT_HEADERS);
  const creditIdx = findColumn(headers, CREDIT_HEADERS);
  const merchantIdx = findColumn(headers, MERCHANT_HEADERS);
  const categoryIdx = findColumn(headers, CATEGORY_HEADERS);

  if (merchantIdx < 0 || (amountIdx < 0 && creditIdx < 0)) {
    return {
      rows: [],
      error:
        "Couldn’t find merchant/description and amount columns. Use headers like Date, Description, Amount, Category.",
      detected: {
        date: dateIdx >= 0 ? table[0][dateIdx] : "",
        amount: amountIdx >= 0 ? table[0][amountIdx] : "",
        merchant: merchantIdx >= 0 ? table[0][merchantIdx] : "",
        category: categoryIdx >= 0 ? table[0][categoryIdx] : undefined,
      },
    };
  }

  const rows: CsvRowDraft[] = [];
  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const merchant = (cells[merchantIdx] || "").trim();
    if (!merchant) continue;

    let amount: number | null = null;
    if (amountIdx >= 0) amount = parseAmount(cells[amountIdx] || "");
    if ((amount == null || amount === 0) && creditIdx >= 0) {
      amount = parseAmount(cells[creditIdx] || "");
    }
    // Some exports put income as positive credit and spending as positive debit in separate cols.
    // Prefer the amount column; skip zero/empty rows.
    if (amount == null || amount <= 0) continue;

    const categoryRaw = categoryIdx >= 0 ? cells[categoryIdx] || "" : "";
    const categoryId = guessCategory(merchant, categoryRaw);
    const date = parseDate(dateIdx >= 0 ? cells[dateIdx] || "" : "");

    rows.push({
      id: `csv-${i}-${merchant.slice(0, 12)}`,
      merchant: merchant.slice(0, 80),
      amount,
      categoryId,
      date,
      note: categoryRaw ? categoryRaw.slice(0, 120) : undefined,
    });
  }

  if (!rows.length) {
    return {
      rows: [],
      error: "No usable transactions found. Check that amount cells have numbers.",
      detected: {
        date: dateIdx >= 0 ? table[0][dateIdx] : "",
        amount: amountIdx >= 0 ? table[0][amountIdx] : "",
        merchant: table[0][merchantIdx],
        category: categoryIdx >= 0 ? table[0][categoryIdx] : undefined,
      },
    };
  }

  return {
    rows: rows.slice(0, 200),
    detected: {
      date: dateIdx >= 0 ? table[0][dateIdx] : "today",
      amount: amountIdx >= 0 ? table[0][amountIdx] : table[0][creditIdx],
      merchant: table[0][merchantIdx],
      category: categoryIdx >= 0 ? table[0][categoryIdx] : undefined,
    },
  };
}

export const SAMPLE_CSV = `Date,Description,Amount,Category
2026-08-01,Blue Bottle Coffee,17.90,Food
2026-08-02,Shell Gas Station,47.04,Transport
2026-08-03,Netflix,15.49,Subscriptions
2026-08-04,Whole Foods Market,62.18,Food
2026-08-05,Uber Trip,18.25,Transport
`;
