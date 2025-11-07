import { Badge } from "@/components/ui/badge"
import type { IncomeCategory, ExpenseCategory } from "@/lib/supabase"

interface CategoryBadgeProps {
  category: IncomeCategory | ExpenseCategory
  variant?: "default" | "outline"
}

// Format category for display (convert snake_case to Title Case)
function formatCategoryLabel(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get color class for income categories
function getIncomeCategoryColor(category: IncomeCategory): string {
  const colorMap: Record<IncomeCategory, string> = {
    rental_income: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    parking_income: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    storage_income: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    pet_fees: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    late_fees: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    utility_reimbursement: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    laundry_income: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    other_income: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return colorMap[category] || colorMap.other_income
}

// Get color class for expense categories
function getExpenseCategoryColor(category: ExpenseCategory): string {
  const colorMap: Record<ExpenseCategory, string> = {
    repairs_maintenance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    property_taxes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    insurance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    utilities: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    property_management: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    hoa_fees: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    landscaping: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pest_control: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
    cleaning: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    legal_fees: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    accounting_fees: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    advertising: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    capital_expenditure: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    other_expense: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return colorMap[category] || colorMap.other_expense
}

// Check if category is an income category
function isIncomeCategory(category: string): category is IncomeCategory {
  return [
    'rental_income',
    'parking_income',
    'storage_income',
    'pet_fees',
    'late_fees',
    'utility_reimbursement',
    'laundry_income',
    'other_income',
  ].includes(category)
}

export function CategoryBadge({ category, variant = "default" }: CategoryBadgeProps) {
  const label = formatCategoryLabel(category)
  const colorClass = isIncomeCategory(category)
    ? getIncomeCategoryColor(category)
    : getExpenseCategoryColor(category as ExpenseCategory)

  return (
    <Badge
      variant={variant}
      className={variant === "default" ? colorClass : ""}
    >
      {label}
    </Badge>
  )
}
