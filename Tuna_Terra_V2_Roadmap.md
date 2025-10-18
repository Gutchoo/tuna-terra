# Tuna Terra — Web App v2 Roadmap

## 🧭 General Summary

This roadmap outlines the phased plan to evolve Tuna Terra from a property-tracking platform into a full portfolio management system.  
The goal is to give users a unified workspace to:

- Create portfolios and add properties (via APN, address, or CSV import)
- View properties as **Cards**, **Table**, or **Map** with a persistent search bar
- Add **Units** within each property (e.g., duplex, triplex, multi-tenant)
- Track **Income** and **Expenses** per property/unit
- Manage and store **Documents** (insurance, tax bills, leases, etc.)
- Track **Insurance Policies** with reminders for renewals and expirations
- Eventually leverage **LLMs** to extract data from uploaded files (e.g., auto-parse tax bills)

This plan is broken down into sprints that progressively build from backend foundation → storage & jobs → frontend architecture → features → automation.  
Each sprint is self-contained and builds toward a scalable, modular system.

---

## 🏁 Phase 0 — Foundation Setup

**Goal:** Define the structure and development rails before any new code.

### Scope

- Finalize information architecture (IA) for portfolios → properties → units.
- Confirm global query pattern for Cards/Table/Map views.
- Establish repo structure for:
  - `migrations/`
  - `api/` routes
  - `components/inspector/`
  - `types/` for shared Zod/Pydantic schemas.

### Deliverables

- IA diagram + navigation layout
- Feature flag for “Financials & Insurance”
- Single source of truth for global search state

---

## 🧱 Sprint 1 — Database Foundation

**Goal:** Extend your existing schema to support units, financials, documents, and insurance.

### Scope

Create new tables:

- `property_units`
- `ledger_entries`
- `documents`
- `insurance_policies`

Add foreign keys, indexes, and RLS policies tied to `portfolio_id` and `org_id`.

### Deliverables

- SQL migrations and seed data
- Types generated (TypeScript or Zod)
- Test queries for linked property → unit → ledger → policy

### Done Criteria

✅ CRUD works via SQL  
✅ RLS verified  
✅ Sample data connects across tables

---

## 🗂️ Sprint 2 — Storage & Background Jobs

**Goal:** Enable document upload and prepare infrastructure for automation.

### Scope

- Create storage bucket `docs/` in Supabase.
- Implement signed URL uploads and metadata PATCH routes.
- Add scheduled edge function (cron) placeholder for:
  - Insurance renewal reminders
  - Future OCR/document parsing

### Deliverables

- `/api/documents/upload` route
- `/api/documents/:id` PATCH metadata
- Daily cron job scaffold

### Done Criteria

✅ Uploads persist in storage  
✅ Metadata written to DB  
✅ Cron executes successfully

---

## 🧭 Sprint 3 — Frontend Architecture

**Goal:** Establish the persistent UI framework and navigation for all future features.

### Scope

- Implement a **global search/filter state** synced to URL.
- Add the **Right Inspector Drawer** with tabs:
  - Overview
  - Units
  - Financials
  - Documents
  - Insurance
- Ensure consistency across Cards, Table, and Map views.

### Deliverables

- `<Inspector>` component
- `<TabPanel>` system for modular tabs
- Saved filter presets

### Done Criteria

✅ Selecting a property opens Inspector  
✅ Tabs render correctly across all views

---

## 🏘️ Sprint 4 — Units MVP

**Goal:** Allow splitting a property into multiple units for granular tracking.

### Scope

- CRUD for units under each property.
- Table view hierarchy (property → unit rows).
- Cards view chip (“Units: 3”) with expandable list.
- Inline editing for unit name, sqft, and occupancy status.

### Deliverables

- `/api/units/*` endpoints
- Optimistic UI updates
- Validation + backfill migration (auto-create 1 default unit)

### Done Criteria

✅ Units can be added/edited/deleted  
✅ Rollups show unit counts per property

---

## 💵 Sprint 5 — Financials v1

**Goal:** Add income & expense tracking per property/unit.

### Scope

- Unified ledger table (`ledger_entries`)
- Inline “Add Transaction” form
- CSV import (bank/export template)
- Rollups by:
  - Month
  - Category
  - Property/Unit

### Deliverables

- `/api/ledger/import` route (with dry-run preview)
- Simple charts/totals on Financials tab
- Seed categories (Rent, Repairs, Insurance, Taxes, etc.)

### Done Criteria

✅ Add/edit income/expenses  
✅ Totals and charts display correctly  
✅ CSV import functional

---

## 🛡️ Sprint 6 — Insurance v1

**Goal:** Track insurance policies and expiration reminders.

### Scope

- Policy CRUD (carrier, policy number, effective/expiration)
- Link uploaded declaration page document
- Status chips: Active / Expiring / Expired
- Scheduled reminders (30/15/7 days before expiration)

### Deliverables

- `/api/insurance/*` endpoints
- Daily reminder job via cron
- Optional email alert via Resend

### Done Criteria

✅ Policies link to properties  
✅ Status auto-updates by date  
✅ Reminder emails/logs sent

---

## 🤖 Sprint 7 — Document AI MVP

**Goal:** Begin automated document parsing and data posting.

### Scope

- Upload → OCR → classify (Tax Bill / Insurance) → extract → review → apply.
- Extraction schemas:
  - Tax Bill: parcel, tax year, totals, installments
  - Insurance: carrier, policy no, coverage dates, limits
- Human-in-loop approval flow

### Deliverables

- Document pipeline server function
- Extraction viewer UI
- Integration posting to ledger/insurance tables

### Done Criteria

✅ Uploaded file auto-parses into draft data  
✅ Manual review → apply updates property/ledger  
✅ Logs recorded in activity table

---

## 🗺️ Sprint 8 — Map & Reporting Polish

**Goal:** Finalize UX and reporting for portfolio analysis.

### Scope

- Map layer toggles:
  - Insurance status heatmap
  - Income/Expense color gradients
- Export options:
  - CSV (ledger)
  - PDF report per property (summary + policy + financials)

### Deliverables

- Report generator endpoint
- Map overlays
- Export button components

### Done Criteria

✅ Reports generate with correct totals  
✅ Map overlays functional  
✅ Portfolio summary export works

---

## ⚙️ Engineering Guardrails

- Feature flags for all new modules (Financials, Insurance, Doc-AI)
- Contract tests for API DTOs
- Idempotent imports & background jobs
- Activity log for all automated actions (LLM, reminders, uploads)

---

## ✅ Implementation Order Summary

1. **Sprint 1–2:** Database + storage foundation
2. **Sprint 3:** Frontend architecture + Inspector
3. **Sprint 4–6:** Core features (Units, Financials, Insurance)
4. **Sprint 7–8:** Automation + reporting polish

This progression ensures a stable backend and cohesive UX before layering in intelligence and automation.
