# Real Estate Financial Modeling - Performance Metrics Guide

This document explains how each performance metric is calculated in the CRE financial modeling system, including formulas, examples, and industry context.

## Table of Contents
- [Overview](#overview)
- [Cash Flow Metrics](#cash-flow-metrics)
- [Return Metrics](#return-metrics)
- [Sale Analysis Metrics](#sale-analysis-metrics)
- [Tax Calculations](#tax-calculations)
- [Loan Calculations](#loan-calculations)
- [Depreciation Calculations](#depreciation-calculations)

---

## Overview

The financial modeling system calculates performance metrics across three main areas:
1. **Annual Operating Performance** - Cash flows during the hold period
2. **Return Analysis** - Overall investment performance metrics
3. **Sale Analysis** - Exit strategy calculations and tax implications

---

## Cash Flow Metrics

### Net Operating Income (NOI)
**Formula:** `Gross Operating Income - Total Operating Expenses`

```
NOI = (Rental Income - Vacancy Loss + Other Income) - Operating Expenses
```

**Components:**
- **Gross Operating Income** = Effective Rental Income + Other Income
- **Effective Rental Income** = Potential Rental Income × (1 - Vacancy Rate)
- **Operating Expenses** = Property taxes, insurance, maintenance, management, utilities

**Example:**
- Potential Rental Income: $120,000
- Vacancy Rate: 5%
- Other Income: $5,000
- Operating Expenses: $45,000
- **NOI = ($120,000 × 0.95 + $5,000) - $45,000 = $74,000**

### Cash Flow Before Taxes (CFBT)
**Formula:** `NOI - Annual Debt Service`

```
CFBT = NOI - (Principal + Interest Payments)
```

**Example:**
- NOI: $74,000
- Annual Debt Service: $48,000
- **CFBT = $74,000 - $48,000 = $26,000**

### Cash Flow After Taxes (CFAT)
**Formula:** `CFBT - Tax Liability`

```
CFAT = CFBT - (Taxable Income × Tax Rate)
```

**Where Taxable Income =** `NOI - Interest Expense - Depreciation - Loan Costs Amortization`

**Example:**
- CFBT: $26,000
- Taxable Income: $15,000
- Tax Rate: 25%
- Tax Liability: $3,750
- **CFAT = $26,000 - $3,750 = $22,250**

---

## Return Metrics

### Internal Rate of Return (IRR)
**Definition:** The discount rate that makes the Net Present Value (NPV) of all cash flows equal to zero.

**Formula:** Solve for r where `NPV = 0`

```
0 = -Initial Investment + CF₁/(1+r)¹ + CF₂/(1+r)² + ... + (CFₙ + Sale Proceeds)/(1+r)ⁿ
```

**Calculation Method:** Newton-Raphson iterative method
- Initial guess: 10%
- Maximum iterations: 1,000
- Tolerance: 0.000001

**Example Cash Flows:**
- Year 0: -$500,000 (initial investment)
- Years 1-9: $22,250 (annual CFAT)
- Year 10: $22,250 + $1,200,000 (CFAT + sale proceeds)
- **IRR ≈ 12.5%**

### Equity Multiple
**Formula:** `Total Cash Returned ÷ Initial Equity Investment`

```
Equity Multiple = (Total CFAT + After-Tax Sale Proceeds) ÷ Initial Investment
```

**Example:**
- Total CFAT over 10 years: $222,500
- After-tax sale proceeds: $1,200,000
- Initial investment: $500,000
- **Equity Multiple = ($222,500 + $1,200,000) ÷ $500,000 = 2.85x**

### Average Cash-on-Cash Return
**Formula:** `(Total CFAT ÷ Hold Period) ÷ Initial Investment`

```
Avg Cash-on-Cash = (Annual CFAT Average) ÷ Initial Investment
```

**Example:**
- Average annual CFAT: $22,250
- Initial investment: $500,000
- **Average Cash-on-Cash = $22,250 ÷ $500,000 = 4.45%**

### Total Return
**Formula:** `Total Cash Returned - Initial Investment`

```
Total Return = Total CFAT + After-Tax Sale Proceeds - Initial Investment
```

**Example:**
- Total cash returned: $1,422,500
- Initial investment: $500,000
- **Total Return = $1,422,500 - $500,000 = $922,500**

---

## Sale Analysis Metrics

### Sale Price Calculation
**Method 1 - Cap Rate:** `NOI(year N+1) ÷ Exit Cap Rate`
**Method 2 - Direct:** User-specified dollar amount

```
Sale Price = Year-After-Hold NOI ÷ Exit Cap Rate
```

**Example:**
- Year 11 projected NOI: $85,000
- Exit cap rate: 6.5%
- **Sale Price = $85,000 ÷ 0.065 = $1,307,692**

### Adjusted Basis
**Formula:** `Original Basis - Accumulated Depreciation`

```
Original Basis = Purchase Price + Acquisition Costs
Adjusted Basis = Original Basis - Cumulative Depreciation
```

**Example:**
- Purchase price: $1,000,000
- Acquisition costs: $30,000
- Accumulated depreciation: $250,000
- **Adjusted Basis = ($1,000,000 + $30,000) - $250,000 = $780,000**

### Capital Gain Components
**Total Gain:** `Sale Price - Selling Costs - Adjusted Basis`

**Depreciation Recapture:** `Min(Accumulated Depreciation, Total Gain)`

**Capital Appreciation:** `Total Gain - Depreciation Recapture`

**Example:**
- Sale price: $1,307,692
- Selling costs: $65,385
- Adjusted basis: $780,000
- Total gain: $462,307
- Accumulated depreciation: $250,000
- **Depreciation Recapture = $250,000**
- **Capital Appreciation = $462,307 - $250,000 = $212,307**

---

## Tax Calculations

### Real Estate Taxable Income
**Formula:** `NOI - Interest Expense - Depreciation - Loan Costs Amortization`

```
Taxable Income = NOI - Deductible Expenses
```

**Deductible Expenses:**
- Interest expense (not principal)
- Depreciation (cost recovery)
- Loan costs amortization
- Operating expenses (already deducted from NOI)

### Tax Liability (Annual)
**Formula:** `Max(Taxable Income × Ordinary Tax Rate, 0)`

```
Annual Tax = Taxable Income × Ordinary Income Tax Rate (if positive)
            = 0 (if negative - creates tax loss)
```

### Sale Tax Calculations
**Capital Gains Tax:** `Capital Appreciation × Capital Gains Tax Rate`

**Depreciation Recapture Tax:** `Depreciation Recapture × Depreciation Recapture Rate`

**Total Tax on Sale:** `Capital Gains Tax + Depreciation Recapture Tax`

**Tax Rates:**
- **Capital Gains:** 0%, 15%, or 20% (based on income)
- **Depreciation Recapture:** Up to 25% (Section 1250)
- **Ordinary Income:** 10% - 37% (for annual operations)

---

## Loan Calculations

### Periodic Payment Calculation
**Formula:** Standard amortization formula

```
PMT = L × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]

Where:
L = Loan amount
r = Periodic interest rate (annual rate ÷ payments per year)
n = Total number of payments (years × payments per year)
```

### Interest vs Principal Split
**Interest Component:** `Outstanding Balance × Periodic Rate`
**Principal Component:** `Payment - Interest Component`

### Loan Balance Calculation
**Formula:** Remaining balance after payments

```
Balance = L × [(1+r)ⁿ - (1+r)ᵖ] / [(1+r)ⁿ - 1]

Where:
p = Number of payments made
```

### Loan Cost Amortization
**Formula:** `Total Loan Costs ÷ Loan Term (years)`

```
Annual Amortization = Loan Costs ÷ Loan Term Years
```

**Tax Treatment:** Loan costs are amortized over the loan term and deductible annually.

---

## Depreciation Calculations

### Depreciable Basis
**Formula:** `(Purchase Price + Acquisition Costs) × Improvements Percentage`

```
Depreciable Basis = Total Acquisition Cost × (Improvements % ÷ 100)
```

**Note:** Only improvements (not land) can be depreciated.

### Annual Depreciation
**Straight-Line Method:** `Depreciable Basis ÷ Recovery Period`

**Recovery Periods:**
- **Residential:** 27.5 years
- **Commercial:** 39 years

**Mid-Month Convention:** First year depreciation is prorated based on acquisition month:
```
First Year = (Depreciable Basis ÷ Recovery Period) × (12.5 - Acquisition Month) ÷ 12
```

### Example Calculation
- Purchase price: $1,000,000
- Acquisition costs: $30,000
- Improvements: 85%
- Property type: Commercial
- Acquisition month: January

**Calculations:**
- Total basis: $1,030,000
- Depreciable basis: $1,030,000 × 0.85 = $875,500
- Annual depreciation: $875,500 ÷ 39 = $22,449
- First year (mid-month): $22,449 × 11.5/12 = $21,516

---

## Debt Service Coverage Ratio (DSCR)

### DSCR Calculation
**Formula:** `NOI ÷ Annual Debt Service`

```
DSCR = Net Operating Income ÷ Total Annual Debt Service
```

### DSCR-Based Loan Sizing
**Formula:** `NOI ÷ Target DSCR = Supportable Debt Service`

```
Max Loan Amount = (NOI ÷ Target DSCR) ÷ Annual Payment per $1 of Loan
```

**Example:**
- NOI: $100,000
- Target DSCR: 1.25
- Supportable debt service: $100,000 ÷ 1.25 = $80,000
- If annual payment rate is 7.5% per dollar: Max loan = $80,000 ÷ 0.075 = $1,066,667

---

## Loan-to-Value (LTV)

### LTV Calculation
**Formula:** `Loan Amount ÷ Property Value`

```
LTV = Loan Amount ÷ (Purchase Price + Acquisition Costs)
```

### LTV-Based Loan Sizing
**Formula:** `Property Value × Target LTV = Loan Amount`

```
Max Loan Amount = (Purchase Price + Acquisition Costs) × Target LTV
```

**Example:**
- Purchase price: $1,000,000
- Acquisition costs: $30,000
- Target LTV: 75%
- **Max loan = $1,030,000 × 0.75 = $772,500**

---

## Key Industry Standards

### Typical Ranges
- **Cap Rates:** 4% - 12% (varies by property type and market)
- **DSCR:** 1.20 - 1.35 (lender requirement)
- **LTV:** 70% - 80% (commercial real estate)
- **IRR Targets:** 8% - 15% (varies by risk profile)
- **Equity Multiple:** 1.5x - 3.0x over 5-10 years

### Tax Rate Guidelines
- **Federal Capital Gains:** 0%, 15%, 20%
- **Depreciation Recapture:** 25% maximum
- **Ordinary Income:** 10% - 37% (federal)
- **State Taxes:** Varies by location

---

This documentation reflects the calculations as implemented in the CRE financial modeling system. All formulas follow industry-standard practices and IRS regulations for real estate taxation.