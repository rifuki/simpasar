# SimPasar — Context & Progress

## Status: MVP Backend + Frontend JALAN ✅

---

## Apa Ini
Market Simulation Platform — user input produk + harga + kota → AI simulate 10 personas → output market insights (penetration %, revenue, rekomendasi). Dibuat untuk **Solana Hackathon** (web3 angle via Solana Pay nanti).

---

## Struktur Project

```
/Users/rifuki/mgodonf/sol/
├── BUSINESS_PLAN.md           # Business strategy lengkap
├── LANDING_PAGE_BRIEF.md      # Brief untuk AI bikin landing page
├── PLAN.md                    # Implementation plan detail
└── simpasar/
    ├── apps/
    │   ├── api/               # Hono + Bun backend (port 3001)
    │   └── web/               # Vite + React + TS frontend (port 5173)
    └── packages/
        └── shared/types.ts    # Shared TypeScript types
```

---

## Tech Stack

**Frontend:** Vite + React + TS, TanStack Query, TanStack Table, Recharts, Framer Motion, Tailwind CSS v4, React Hook Form + Zod v3

**Backend:** Hono + Bun, Zod validation, `@hono/zod-validator`

**AI:** Multi-provider via `LLM_PROVIDER` env:
- `codex` — OpenAI Codex OAuth (gpt-5.3-codex) via `chatgpt.com/backend-api/codex/responses` ← AKTIF
- `anthropic` — Anthropic SDK (butuh API key)
- `naisu` — Via naisu-agent gateway (port 8787)

---

## File Penting Backend (`apps/api/src/`)

| File | Fungsi |
|------|--------|
| `index.ts` | Hono entry point, port 3001 |
| `routes/simulation.ts` | POST /api/simulation/run |
| `routes/cities.ts` | GET /api/cities |
| `services/claudeService.ts` | LLM router (codex/anthropic/naisu) |
| `services/codexService.ts` | OpenAI Codex SSE streaming client |
| `services/promptBuilder.ts` | Build system + user prompt dari personas |
| `lib/codexAuth.ts` | OAuth PKCE flow, token refresh, credentials storage |
| `data/personas.ts` | 50 hardcoded personas (5 kota × 10) |
| `data/cities.ts` | 5 kota: Malang, Bandung, Surabaya, Yogyakarta, Semarang |
| `schemas/simulationSchema.ts` | Zod request validation |
| `scripts/login-codex.ts` | CLI login OAuth |
| `codex-credentials.json` | Token OAuth (gitignored) — expires 2026-04-09 |

---

## File Penting Frontend (`apps/web/src/`)

| File | Fungsi |
|------|--------|
| `pages/SimulationPage.tsx` | Halaman utama (form → loading → results) |
| `components/simulation/SimulationForm.tsx` | Form input produk + kota |
| `components/simulation/LoadingAnimation.tsx` | Animasi step-by-step saat AI berpikir |
| `components/results/SummaryCard.tsx` | Penetration gauge, revenue, harga optimal |
| `components/results/SegmentChart.tsx` | Recharts bar chart per segmen |
| `components/results/PersonaTable.tsx` | TanStack Table dengan filter buy/consider/pass |
| `hooks/useSimulation.ts` | TanStack Query hooks |
| `lib/api.ts` | Fetch wrapper ke backend |
| `lib/codexAuth.ts` | OAuth utils |

---

## Environment (`apps/api/.env`)

```
LLM_PROVIDER=codex
FRONTEND_URL=http://localhost:5173
SKIP_PAYMENT=true
PORT=3001
```

---

## Cara Jalankan

```bash
# Backend
cd simpasar/apps/api && bun dev

# Frontend
cd simpasar/apps/web && bun dev

# Login Codex (jika token expired)
cd simpasar/apps/api && bun run login:codex
```

---

## API Endpoints

| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/api/simulation/run` | ✅ Jalan |
| GET | `/api/cities` | ✅ Jalan |
| GET | `/api/health` | ✅ Jalan |
| POST | `/api/payment/verify` | ⏳ Belum (Solana Pay) |
| GET | `/api/payment/status/:ref` | ⏳ Belum (Solana Pay) |

---

## Codex OAuth Details (dari reverse engineering naisu-agent)

- **Endpoint:** `https://chatgpt.com/backend-api/codex/responses`
- **Auth:** Bearer token dari OAuth PKCE
- **Headers wajib:** `chatgpt-account-id`, `originator`, `User-Agent: pi (darwin; arm64)`, `OpenAI-Beta: responses=experimental`
- **Response:** SSE streaming, event types: `response.output_text.delta`, `response.output_text.done`, `response.completed`
- **Model:** `gpt-5.3-codex`
- **Client ID:** `app_EMoamEEZ73f0CkXaXp7hrann`

---

## Yang Sudah Jalan (Demo Screenshot)
- Form input: nama produk, kategori, harga, kota (radio), deskripsi
- Loading animation dengan step progress
- SummaryCard: penetration gauge animasi, revenue range, harga optimal, confidence score
- Rekomendasi text dari AI
- Risiko & peluang list
- SegmentChart (Recharts) — breakdown per usia/income
- PersonaTable (TanStack Table) — filter buy/consider/pass, per-persona reasoning

---

## Yang Belum Dibuat

- [ ] Solana Pay integration (payment gate sebelum simulasi)
- [ ] Landing page (sudah ada brief di `LANDING_PAGE_BRIEF.md`)
- [ ] Route `/api/payment/verify` dan `/api/payment/status/:ref`
- [ ] `PaymentModal.tsx` — QR code Solana Pay
- [ ] `MERCHANT_WALLET_ADDRESS` di env

---

## Notes Penting

- Zod v3 di frontend (bukan v4) karena `@hookform/resolvers` compat issue dengan Zod v4
- Shared types di `packages/shared/types.ts`, di-resolve via `@shared/*` path alias
- `marketPenetration` dihitung di backend (bukan dari AI) untuk konsistensi
- Token Codex OAuth: expires 2026-04-09, auto-refresh via `codexAuth.ts`
- Naisu-agent tetap ada sebagai fallback tapi SimPasar jalan independent
