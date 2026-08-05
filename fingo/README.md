# FinGo

FinGo is a gamified personal finance app — streaks, collaborative goals, and an AI coach that makes money management feel rewarding.

## Features

- **Home Hub** — Tip of the Day, income vs spending momentum, category budgets
- **Bills & Subscriptions** — timeline calendar, status tags, subscription toggles, automation prompts
- **Collaborative Goals** — shared saving pools, contribution feed, friend invites
- **Profile & Community** — level/streak/points, Avatar Shop, social feed
- **AI Coach** — conversational tips and insight cards

## Design

**Vibrant Growth System** — Be Vietnam Pro, bold rounded geometry, soft shadows, high-contrast mint/emerald with coral and sky accents.

## Getting started

```bash
cd fingo
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000). You’ll be prompted to log in first.

**Demo account:** `alex@fingo.app` / `streak123` (or tap “Continue with demo account”).  
Any email + password (6+ characters) also works for this prototype.

## AI Coach

The coach is a real LLM grounded in your FinGo snapshot (budgets, bills, goals).

**Default (local):** [Ollama](https://ollama.com) with `llama3.2:3b`

```bash
ollama serve
ollama pull llama3.2:3b
```

**Optional cloud providers:** set `OPENAI_API_KEY` or `GROQ_API_KEY` (see `.env.example`).

## Receipt scan

On **Scan**, take or upload a receipt photo. FinGo runs OCR, structures the result with the local LLM, then updates category spending and the Home pie chart after you confirm.

OCR runs on the server with the native Tesseract binary (fast and reliable):

```bash
sudo apt-get install -y tesseract-ocr
```

If the binary isn't installed, the app automatically falls back to in-browser OCR (tesseract.js), which is slower and downloads ~15 MB of model data on first scan.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
