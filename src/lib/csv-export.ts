import type { Property } from './supabase'

/**
 * Escape a value for CSV format
 * Wraps values containing quotes, commas, or newlines in quotes
 * Escapes internal quotes by doubling them
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Check if value needs escaping (contains quotes, commas, or newlines)
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape internal quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""')
    return `"${escaped}"`
  }

  return stringValue
}

/**
 * Format a property value for CSV export
 * Handles different data types appropriately
 */
function formatPropertyValue(value: unknown, key: keyof Property): string {
  if (value === null || value === undefined) {
    return ''
  }

  // Handle arrays (like tags)
  if (Array.isArray(value)) {
    return value.join('; ')
  }

  // Handle dates - format to ISO string
  if (key === 'created_at' || key === 'updated_at' || key === 'sale_date' || key === 'purchase_date') {
    try {
      const date = new Date(value as string)
      return date.toISOString().split('T')[0] // Just the date part
    } catch {
      return String(value)
    }
  }

  // Handle numbers - ensure proper formatting
  if (typeof value === 'number') {
    return value.toString()
  }

  // Handle objects - stringify them
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Export properties to CSV file
 * Includes essential property fields for user management
 */
export function exportPropertiesToCSV(properties: Property[], portfolioName: string): void {
  if (properties.length === 0) {
    throw new Error('No properties to export')
  }

  // Define columns to include (simplified essential fields)
  const columns: Array<{ key: keyof Property; label: string }> = [
    // Core identifier
    { key: 'apn', label: 'APN' },

    // Address information
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip_code', label: 'Zip Code' },

    // Property details
    { key: 'owner', label: 'Owner' },
    { key: 'insurance_provider', label: 'Insurance Provider' },
    { key: 'management_company', label: 'Property Management' },

    // Financial data
    { key: 'purchase_date', label: 'Purchase Date' },
    { key: 'purchase_price', label: 'Purchase Price' },
    { key: 'sale_price', label: 'Sale Price' },
    { key: 'sale_date', label: 'Sale Date' },
  ]

  // Build CSV header row
  const headerRow = columns.map(col => escapeCSVValue(col.label)).join(',')

  // Build CSV data rows
  const dataRows = properties.map(property => {
    return columns.map(col => {
      const value = property[col.key]
      const formatted = formatPropertyValue(value, col.key)
      return escapeCSVValue(formatted)
    }).join(',')
  })

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0]
  const sanitizedPortfolioName = portfolioName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const filename = `${sanitizedPortfolioName}-properties-${date}.csv`

  // Trigger download
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}
