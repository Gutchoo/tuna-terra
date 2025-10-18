"use client"

import * as React from "react"
import {
  Building2,
  Calculator,
  GraduationCap,
  Settings,
  Briefcase
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { usePortfolios, useUpdateLastUsedPortfolio } from "@/hooks/use-portfolios"
import { isVirtualSamplePortfolio } from "@/lib/sample-portfolio"
import { TerraLogo } from "@/components/ui/terra-logo"

const navigationSections = [
  {
    id: "properties",
    title: "Properties",
    icon: Building2,
    href: "/dashboard",
    description: "Manage your property portfolio"
  },
  {
    id: "financial-modeling",
    title: "Financial Modeling",
    icon: Calculator,
    href: "/financial-modeling",
    description: "Analyze investment returns and projections"
  },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    href: "/education",
    description: "Learn real estate fundamentals"
  }
]

const settingsSections = [
  {
    id: "portfolios",
    title: "Manage Portfolios",
    icon: Settings,
    href: "/dashboard/portfolios",
    description: "Portfolio settings and sharing"
  }
]

export function PropertiesSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPortfolioId = searchParams.get('portfolio_id')
  const { state } = useSidebar()

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

  const getPortfolioInitials = React.useCallback((name: string) => {
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      // Single word: take first letter
      return words[0].charAt(0).toUpperCase()
    } else {
      // Multiple words: take first letter of first two words
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
  }, [])

  return (
    <Sidebar {...props} variant="inset" collapsible="icon">
      {/* TunaTerra Logo Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
          <div className="flex-shrink-0">
            <TerraLogo size="md" alt="TunaTerra" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0">
            <span className="font-semibold text-base">TunaTerra</span>
          </div>
        </div>

        {/* Portfolio Selector - full selector when expanded */}
        <div className="group-data-[collapsible=icon]:hidden">
          {portfoliosLoading ? (
            <div className="h-10 bg-muted rounded animate-pulse" />
          ) : (
            <Select value={currentPortfolioId || ''} onValueChange={handlePortfolioChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select portfolio">
                  {selectedPortfolio ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium truncate">{selectedPortfolio.name}</span>
                      {isVirtualSamplePortfolio(selectedPortfolio.id) && (
                        <Badge className="text-xs flex-shrink-0 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Demo
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {portfolios?.map((portfolio) => (
                  <SelectItem key={`portfolio-${portfolio.id}`} value={portfolio.id}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{portfolio.name}</span>
                      {isVirtualSamplePortfolio(portfolio.id) ? (
                        <Badge className="text-xs flex-shrink-0 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Demo
                        </Badge>
                      ) : (
                        <Badge className={`text-xs flex-shrink-0 ${getRoleColor(portfolio.membership_role)}`}>
                          {portfolio.membership_role}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Portfolio Icon - only visible when collapsed */}
        {state === "collapsed" && selectedPortfolio && (
          <div className="hidden group-data-[collapsible=icon]:block pb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {}}
                  tooltip={`Current Portfolio: ${selectedPortfolio.name}`}
                >
                  <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
                    {getPortfolioInitials(selectedPortfolio.name)}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationSections.map((section) => {
                const Icon = section.icon
                const isActive = section.id === "properties"

                return (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (section.href.startsWith('/dashboard')) {
                          // Preserve portfolio context for dashboard routes
                          router.push(`${section.href}${currentPortfolioId ? `?portfolio_id=${currentPortfolioId}` : ''}`)
                        } else {
                          router.push(section.href)
                        }
                      }}
                      tooltip={section.description}
                    >
                      <Icon className="size-4" />
                      <span>{section.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsSections.map((section) => {
                const Icon = section.icon

                return (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      onClick={() => router.push(section.href)}
                      tooltip={section.description}
                    >
                      <Icon className="size-4" />
                      <span>{section.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
