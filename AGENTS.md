# AGENTS.md

## Cursor Cloud specific instructions

This repo's active product is **Mintly** (aka "vibespend"), a client-only, mobile-first
personal-finance dashboard built with Vite + React 19 + TypeScript. All app code lives in
the `vibespend/` subdirectory — run every npm command from there, not the repo root.

There is no backend, database, or external service; it is a single static SPA driven by
hardcoded data in `vibespend/src/data.ts`.

### Services / commands

Standard scripts are defined in `vibespend/package.json` (`dev`, `build`, `lint`, `preview`).

- Dev server: `npm run dev` in `vibespend/` (Vite on `http://localhost:5173/`).
- Lint: `npm run lint` (oxlint).
- Build: `npm run build` (runs `tsc -b` then `vite build`).

### Notes / gotchas

- Node 22 (>= 22.12) is required by Vite 8; the default cloud image (Node 22.x) works.
- `npm run build` currently prints a "chunks larger than 500 kB" warning — that is expected
  and not a failure.
- The root also contains unrelated Jupyter notebooks (`*.ipynb`); they are not part of the
  Mintly app and need no setup.
