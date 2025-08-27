# Tuna Terra — Current Plan (Dec 2024)

A focused industrial/CRE web app where users create portfolios, enrich properties with parcel data, and run clean, defensible financial models. Keep scope tight; ship in small slices.

---

## 0) Current Snapshot (Updated Dec 2024)

### ✅ Completed Features
- **Auth & Portfolios**: Multi-tenant system with owner/editor/viewer roles and RLS policies
- **Demo Portfolio**: Virtual sample portfolio with **LAX**, **UC Berkeley**, **Santa Monica Pier** (read-only for all users)
- **Modal-First Property Upload**: Streamlined 3-step modal workflow with CSV, APN, and Address methods
- **Lookups/Quotas**: 10 parcel lookups per user with automatic credit management and fallback to basic mode
- **Map View**: Interactive Mapbox integration - polygons for enriched properties, point markers for address-only
- **Property Management**: Table and card views with 30+ Regrid fields, customizable display, bulk operations
- **Education System**: CCIM-style lessons and professional calculators at `/education` and `/tools`
- **Financial Modeling UI**: 4-tab interface (Assumptions, Results, Cash Flows, Charts) at `/tools/financial-modeling`
- **Theme Support**: Light/dark mode with Sonner toast notifications
- **Real-time Collaboration**: Email-based portfolio sharing with permission levels

### 🚧 In Progress (v2-financial-modeling branch)
- **Financial Modeling Promotion**: Moving from `/tools` to primary navigation
- **Route Optimization**: Creating `/modeling` alias for cleaner URLs
- **Dashboard Integration**: Adding prominent CTAs in empty states and quick actions

> **Note**: "Pro Lookups" terminology retained for now - users understand the value proposition

---

## 1) Goals (next 2–3 milestones)

1. **Finish the Financial Modeling feature** and tie it to saved properties/investments.
2. **Property Data Enrichment**: pull CRE‑relevant area stats (crime, population growth, job growth, wage growth, etc.) into a metrics panel.
3. **Demo Improvements**: Guided, overlay‑style first‑time tour + public demo mode from homepage (no login).

Keep everything simple and shippable.

---

## 2) Information Architecture (near‑term)

- **Home**: Big CTA cards → **Financial Modeling** and **Parcel Lookup**; secondary links → Education and Tools.
- **Portfolios**: Table + Map toggle. Polygons for enriched; point markers for address‑only.
- **Property Page**: Tabs → Overview | Valuations | Metrics | Notes | Files.
- **Financial Modeling**: Promoted in the top‑level nav & home hero button.

---

## 3) Data Model Changes (delta)

- `user_quotas` (user_id, parcel_lookups_used, limit_default=10)
- `properties`: keep apn/address; add `geocode_point` (lat, lng) nullable; `has_parcel_enhance` boolean.
- `valuations` (id, property_id, name, type \[dcf|caprate], created_by, created_at)
- `valuation_inputs` (valuation_id, schema_version, payload_json)
- `valuation_results` (valuation_id, payload_json, computed_at)
- `property_metrics` (property_id, metric_key, value, source, period_start, period_end)
- `tutorial_progress` (user_id, tour_key, completed_at)

RLS: Scope by org membership; allow read of demo/public items.

---

## 4) Financial Modeling — Scope to Ship (Priority #1)

**Purpose:** A dependable DCF that saves scenarios to a property or runs standalone.

### UI (current 4 tabs)

- **Assumptions** (4 pages): Property | Income | Financing | Exit & Tax
- **Results**: Summary KPIs (Price, IRR, Cash‑on‑Cash, DSCR, Value per SF), value bands.
- **Cash Flows**: Annual table (at least 10 years) with export to CSV.
- **Charts**: Revenue/NOI trend, DSCR over time, Equity vs Debt.

### Input Schema (v1)

```json
{
  "property": { "name": "", "address": "", "sf": 0, "units": 0, "market": "" },
  "income": {
    "start_noi": 0,
    "rent_growth": 0.02,
    "other_income": 0,
    "vacancy": 0.05
  },
  "expenses": {
    "opex": 0,
    "opex_growth": 0.02,
    "capex": 0,
    "capex_growth": 0.02
  },
  "financing": {
    "purchase_price": 0,
    "ltv": 0.6,
    "rate": 0.065,
    "amort_years": 30,
    "interest_only_years": 0
  },
  "tax_exit": {
    "exit_year": 5,
    "exit_cap": 0.065,
    "purchase_costs_pct": 0.01,
    "sale_costs_pct": 0.02,
    "depr_method": "MACRS_39",
    "land_pct": 0.2,
    "fed_rate": 0.21,
    "state_rate": 0.08
  }
}
```

### Engine

- Deterministic calculator (pure TS) from inputs → annual cash flows → KPIs.
- Debt schedule with IO support; DSCR calculation.
- Exit value = Year N+1 NOI / Exit Cap; apply sale costs; taxes (simple first‑pass recognizing depreciation recapture later).

### Persistence & Tying to Properties

- Allow **link to a property** (dropdown) or run **standalone** (saves as unattached valuation).
- Save inputs/results to `valuations`/`valuation_inputs`/`valuation_results`.
- Show **Latest Valuation** on the property page (Overview tab).

### Acceptance Criteria

- Given a seed scenario, calculator outputs match fixture tests within tolerance.
- Save/Load round‑trip works; edits persist; version `schema_version` recorded.
- Results tab shows KPIs; Cash Flows export CSV; Charts render without blocking UI.
- If user not logged in: allow demo run; persist to memory only; prompt to sign up to save.

---

## 5) Property Data Enrichment — Scope to Ship (Priority #2)

**Purpose:** Give at‑a‑glance market context.

### Metrics (initial set)

- **Population growth** (5y), **Job growth** (5y), **Wage growth** (5y)
- **Crime index** (relative scale, recent year)
- **Commute/transport access** (freeway distance buckets, ports)

### UX

- New **Metrics** panel on the Property page.
- Source badges; hover tooltips for definitions.

### Tech

- Edge function per metric source → normalize → upsert `property_metrics`.
- Batch by county/census tract where possible; cache.

### Acceptance Criteria

- Metrics render for demo properties and any property with lat/lng (parcel enhanced or geocoded address).
- Source + last‑updated displayed; errors fail soft with placeholders.

---

## 6) Demo & Guided Tour — Scope to Ship (Priority #3)

**Purpose:** Reduce first‑time friction and showcase value.

### Guided Tour (in‑app)

- Overlay steps (tooltips) walking through demo portfolio, map toggle, parcel lookup, and financial model.
- Track completion in `tutorial_progress`.

### Public Demo (no login)

- Homepage **“Try the Demo”** opens an ephemeral session scoped to demo data (read‑only, plus **guest** DCF runs that don’t persist).
- CTA to sign up when saving a valuation or performing a parcel lookup.

### Acceptance Criteria

- Tour is dismissible and rerunnable from Help menu; state remembered.
- Public demo is isolated; no writes to real user tables.

---

## 7) Engineering Tasks (by slice)

### Slice A — Promote Financial Modeling

- Add **Financial Modeling** to top nav and home hero.
- Create `/modeling` route alias to current page.

### Slice B — DCF Engine & Persistence

- Implement pure TS DCF engine + tests.
- Wire inputs to engine; Results/Cash Flows/Charts.
- Persist to `valuations` tables; link to property.

### Slice C — Map View for Non‑Enriched

- Geocode address to `geocode_point` (point‑only marker).
- Render polygons only when `has_parcel_enhance = true`.

### Slice D — Metrics Panel

- Create `property_metrics` table & edge job.
- Render Metrics panel with loading/skeleton states.

### Slice E — Guided Tour & Public Demo

- Add tour (client‑side driver) + progress tracking.
- Guest demo session with demo portfolio; block writes; upgrade CTA.

---

## 8) QA Checklist (per release)

- Calculator numeric regression tests pass.
- RLS verified with second user and guest demo.
- Map renders: polygon for enhanced, point for address‑only.
- Metrics display with source & date; failures degrade gracefully.
- Tour works across desktop/mobile; accessible keyboard nav.

---

## 9) "Master Prompt"

You are implementing **Tuna Terra – Next Milestones**. Work in small, shippable slices and commit after each task with a concise CHANGELOG. If a spec is ambiguous, choose the simplest option consistent with this plan and proceed.

**Slice A – Promote Financial Modeling**

1. Add top‑nav and home hero CTA linking to `/modeling`.
2. Create `/modeling` route alias to existing Financial Modeling page.

**Slice B – DCF Engine & Persistence**

1. Create a pure TypeScript DCF engine using the **Input Schema (v1)** above.
2. Build unit tests with seed fixtures to validate outputs.
3. Wire the 4 tabs (Assumptions/Results/Cash Flows/Charts) to the engine.
4. Create tables `valuations`, `valuation_inputs`, `valuation_results`; store `schema_version`.
5. Allow linking a valuation to a selected property (or standalone).
6. CSV export for Cash Flows; basic error states.

**Slice C – Map for Non‑Enriched**

1. Add geocoding for address‑only properties → save `geocode_point`.
2. Update map: show point markers when `has_parcel_enhance = false`; polygons otherwise.

**Slice D – Metrics Panel**

1. Create `property_metrics` table and an edge function that upserts demo metrics.
2. Render Metrics panel with placeholders; show source badges and last‑updated.

**Slice E – Guided Tour & Public Demo**

1. Implement a client‑side guided tour over the demo portfolio; track completion in `tutorial_progress`.
2. Add homepage **Try the Demo**: guest session, read‑only demo data, prompt sign‑up on save/lookup.

**Done means**: All acceptance criteria above pass, tests are green, and RLS is verified.
