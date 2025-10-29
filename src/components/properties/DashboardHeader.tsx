"use client"

import * as React from "react"
import { TerraLogo } from "@/components/ui/terra-logo"
import { UserMenu } from "@/components/user-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { usePortfolios, useUpdateLastUsedPortfolio } from "@/hooks/use-portfolios"
import { isVirtualSamplePortfolio } from "@/lib/sample-portfolio"

export function DashboardHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')

  const { data: portfolios = [], isLoading: portfoliosLoading } = usePortfolios(true)
  const updateLastUsedPortfolio = useUpdateLastUsedPortfolio()

  const selectedPortfolio = React.useMemo(() =>
    portfolios.find(p => p.id === currentPortfolioId),
    [portfolios, currentPortfolioId]
  )

  const handlePortfolioChange = React.useCallback((portfolioId: string) => {
    router.push(`/dashboard?portfolio_id=${portfolioId}`)

    // Track portfolio usage
    if (!isVirtualSamplePortfolio(portfolioId) && !updateLastUsedPortfolio.isPending) {
      const portfolioData = portfolios.find(p => p.id === portfolioId)
      if (portfolioData && !portfolioData.is_default) {
        updateLastUsedPortfolio.mutate(portfolioId)
      }
    }
  }, [router, updateLastUsedPortfolio, portfolios])

  const getRoleColor = React.useCallback((role?: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'editor': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'viewer': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-6 border-b bg-background">
      {/* Left: Logo and App Name */}
      <div className="flex items-center gap-2">
        <TerraLogo className="h-6 w-6" />
        <span className="font-semibold text-lg">TunaTerra</span>
      </div>

      {/* Center: Portfolio Selector */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <Select
          value={currentPortfolioId || undefined}
          onValueChange={handlePortfolioChange}
          disabled={portfoliosLoading}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select portfolio...">
              {selectedPortfolio ? (
                <div className="flex items-center gap-2">
                  <span className="truncate">{selectedPortfolio.name}</span>
                  {selectedPortfolio.membership_role && (
                    <Badge
                      variant="outline"
                      className={`${getRoleColor(selectedPortfolio.membership_role)} text-xs px-1.5 py-0 h-5 capitalize`}
                    >
                      {selectedPortfolio.membership_role}
                    </Badge>
                  )}
                </div>
              ) : 'Select portfolio...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id}>
                <div className="flex items-center gap-2">
                  <span className="truncate">{portfolio.name}</span>
                  {portfolio.membership_role && (
                    <Badge
                      variant="outline"
                      className={`${getRoleColor(portfolio.membership_role)} text-xs px-1.5 py-0 h-5 capitalize`}
                    >
                      {portfolio.membership_role}
                    </Badge>
                  )}
                  {portfolio.is_sample && !isVirtualSamplePortfolio(portfolio.id) && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      Sample
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: User Menu */}
      <div>
        <UserMenu />
      </div>
    </header>
  )
}
