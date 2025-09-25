# Deal Summary Panel

> **View:** [ Before-Tax ](toggle) | [ After-Tax ](toggle)

---

## 0) Investment Snapshot

- **Purchase Price:** ${{purchase_price}}
- **Acquisition Costs:** ${{closing_costs}}
- **Loan Costs (Points/Fees):** ${{loan_costs}}
- **Total Project Cost:** ${{total_project_cost}} <!-- price + closing + loan + capex (if any) -->
- **Loan Amount:** ${{loan_amount}} (LTV: {{ltv_pct}}%)
- **Initial Investment:** ${{initial_equity}}
  - _Calc:_ **Price + Costs + Loan Costs − Loan Proceeds**

---

## 1) Returns — Headline

- **Levered IRR:** {{irr_levered_pct}}%
- **Unlevered IRR:** {{irr_unlevered_pct}}%
- **Equity Multiple:** {{equity_multiple}}×
- **NPV @ {{discount_rate_pct}}%:** ${{npv}}

> **After-Tax toggle** replaces these with: **After-Tax IRR**, **After-Tax Equity Multiple**, and **After-Tax NPV**.

---

## 2) Income & Yield

- **Year-1 NOI:** ${{noi_y1}}
- **Purchase Cap Rate:** {{cap_rate_purchase_pct}}% <!-- NOI_y1 / Purchase Price -->
- **Cash-on-Cash (Y1):** {{coc_y1_pct}}% <!-- Levered CF_y1 / Equity -->
- **Stabilized Yield on Cost:** {{yield_on_cost_pct}}% <!-- Stabilized NOI / Total Project Cost -->

> **After-Tax view:** show **After-Tax Cash Flow (Y1)** and **Taxable Income (Y1)**.

---

## 3) Debt Health (If Levered)

- **Interest Rate / Amort:** {{interest_rate_pct}}% / {{amort_years}} yrs
- **Annual Debt Service:** ${{annual_debt_service}}
- **DSCR (Y1):** {{dscr_y1}}× <!-- NOI_y1 / ADS -->
- **Debt Yield (Y1):** {{debt_yield_pct}}% <!-- NOI_y1 / Loan Amount -->

---

## 4) Exit Snapshot ({{hold_years}}-yr Hold)

- **Exit Cap Rate:** {{exit_cap_pct}}%
- **Projected Sale Price:** ${{sale_price_proj}}
- **Net Sales Proceeds (to Equity):** ${{net_sale_to_equity}}
- **Gain on Sale (Pre-Tax):** ${{gain_pre_tax}}

> **After-Tax view:**
>
> - **Depreciation Recapture:** ${{recapture_amt}} @ 25%
> - **LTCG Portion:** ${{ltcg_amt}} @ {{ltcg_rate_pct}}%
> - **Taxes on Sale:** ${{taxes_on_sale}}
> - **Net Proceeds After Tax:** ${{net_proceeds_after_tax}}

---

## 5) Sensitivities (Mini)

- **IRR vs Exit Cap (±50 bps):** {{irr_sens_exit_cap}}
- **IRR vs Rent Growth (±100 bps):** {{irr_sens_rent_growth}}
- **DSCR vs Rate (±50 bps):** {{dscr_sens_rate}}

> Keep as small inline chips (e.g., “Exit Cap −50 bps → IRR {{irr_neg50bps}}% / +50 bps → {{irr_pos50bps}}%”).

---

## 6) Flags & Covenants

- **Min DSCR Breach?** {{flag_dscr}} <!-- Yes/No -->
- **Max LTV Breach at Refi/Exit?** {{flag_ltv}}
- **Negative Y1 CoC?** {{flag_coc}}

---

## Notes / Assumptions

- **Depreciable Basis (BLDG only):** ${{depr_basis}} over {{recovery_years}} yrs (Mid-Month)
- **Ordinary Rate:** {{tax_ordinary_pct}}% • **LTCG:** {{tax_ltcg_pct}}% • **NIIT:** {{niit_pct}}% (if applicable)
- **Recapture (Sec. 1250):** up to accumulated straight-line at 25%
- **Selling Costs:** {{sell_cost_pct}}% of sale price
- **Discount Rate:** {{discount_rate_pct}}%

---

### Glossary (hover or tooltip)

- **Equity Multiple:** Σ Distributions ÷ Initial Equity
- **Cash-on-Cash:** Levered CF ÷ Equity (period)
- **Yield on Cost:** Stabilized NOI ÷ Total Project Cost
- **DSCR:** NOI ÷ Annual Debt Service
