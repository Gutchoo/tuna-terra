/**
 * Navigation utilities for maintaining portfolio context across the application
 */

/**
 * Build a URL with portfolio context preserved
 * @param basePath - The base path (e.g., '/dashboard', '/dashboard/map')
 * @param portfolioId - The current portfolio ID to maintain in the URL
 * @returns The complete URL with portfolio_id parameter if provided
 */
export function buildPortfolioUrl(basePath: string, portfolioId: string | null): string {
  if (!portfolioId) {
    return basePath
  }
  
  const url = new URL(basePath, window.location.origin)
  url.searchParams.set('portfolio_id', portfolioId)
  return url.pathname + url.search
}

/**
 * Get current portfolio ID from URL search params (client-side)
 * @returns The portfolio ID from the URL or null if not present
 */
export function getCurrentPortfolioId(): string | null {
  if (typeof window === 'undefined') return null
  
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('portfolio_id')
}

/**
 * Create portfolio-aware navigation URLs for dashboard layout
 * @param currentPortfolioId - The current portfolio ID to preserve
 * @returns Object with navigation URLs that maintain portfolio context
 */
export function createPortfolioAwareNavigation(currentPortfolioId: string | null) {
  return {
    home: buildPortfolioUrl('/dashboard', currentPortfolioId),
    properties: buildPortfolioUrl('/dashboard', currentPortfolioId),
    map: buildPortfolioUrl('/dashboard/map', currentPortfolioId),
    portfolios: '/dashboard/portfolios', // Portfolio management doesn't need portfolio context
    settings: '/dashboard/settings'
  }
}