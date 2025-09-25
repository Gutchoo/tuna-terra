'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, Building, ChevronDown, ChevronUp, Star, Users } from 'lucide-react'
import { usePortfolios } from '@/hooks/use-portfolios'
import { isVirtualSamplePortfolio } from '@/lib/sample-portfolio'

export function PortfolioStatusDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: portfolios = [], isLoading } = usePortfolios(true)

  // Only show in development when test data is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DATA === 'false') {
    return null
  }

  const getPortfolioTypeBadge = (portfolio: { id: string; is_sample?: boolean }) => {
    if (isVirtualSamplePortfolio(portfolio.id)) {
      return <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">Virtual Demo</Badge>
    }
    if (portfolio.is_sample) {
      return <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Sample Portfolio</Badge>
    }
    return <Badge variant="outline" className="text-xs">User Portfolio</Badge>
  }

  const getLastUsedBadge = (portfolio: { is_default?: boolean }) => {
    if (portfolio.is_default) {
      return <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
        <Star className="h-3 w-3 mr-1" />
        Last Used
      </Badge>
    }
    return null
  }

  const getRoleBadge = (portfolio: { id: string; membership_role?: string }) => {
    if (isVirtualSamplePortfolio(portfolio.id)) {
      return <Badge variant="secondary" className="text-xs">Viewer</Badge>
    }
    return <Badge variant="secondary" className="text-xs">{portfolio.membership_role || 'Owner'}</Badge>
  }


  const userPortfolios = portfolios.filter(p => !isVirtualSamplePortfolio(p.id))
  const virtualPortfolio = portfolios.find(p => isVirtualSamplePortfolio(p.id))

  return (
    <Card className="fixed bottom-4 right-[420px] w-96 z-50 bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between text-green-700">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Portfolio Status Debug Panel (Dev Only)
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-700 hover:bg-green-100"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-medium text-green-700 mb-2">
              Active Portfolios & Last-Used Status:
            </div>
            <Badge variant="outline" className="text-xs">
              Shows which portfolio is marked as last-used (is_default = true)
            </Badge>
          </div>

          {isLoading ? (
            <div className="text-xs text-green-600">Loading portfolios...</div>
          ) : (
            <div className="space-y-3">
              {/* Virtual Demo Portfolio */}
              {virtualPortfolio && (
                <div className="p-3 border rounded-lg bg-white/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Building className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{virtualPortfolio.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getPortfolioTypeBadge(virtualPortfolio)}
                    {getRoleBadge(virtualPortfolio)}
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {virtualPortfolio.property_count || 3} properties
                    </Badge>
                  </div>
                </div>
              )}

              {/* User Portfolios */}
              {userPortfolios.length > 0 ? (
                userPortfolios.map((portfolio) => (
                  <div key={portfolio.id} className="p-3 border rounded-lg bg-white/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Building className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{portfolio.name}</span>
                      </div>
                      {getLastUsedBadge(portfolio)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getPortfolioTypeBadge(portfolio)}
                      {getRoleBadge(portfolio)}
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {portfolio.property_count || 0} properties
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      ID: {portfolio.id.slice(0, 8)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-green-600 italic">No user portfolios found</div>
              )}
            </div>
          )}

          <div className="text-xs text-green-600 space-y-1">
            <div>Shows real-time portfolio status and last-used tracking.</div>
            <div className="font-medium">🏢 Perfect for debugging portfolio switching!</div>
            <div>Last Used badge shows which portfolio user will land on by default.</div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}