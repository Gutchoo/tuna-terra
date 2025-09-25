import { Suspense } from 'react'
// import { Button } from '@/components/ui/button' // Disabled with settings button
// import Link from 'next/link' // Disabled with settings button
// import { SettingsIcon } from 'lucide-react' // Disabled with settings button
import { UserMenu } from '@/components/user-menu'
import { PortfolioAwareNavigation, PortfolioAwareHomeButton } from '@/components/navigation/PortfolioAwareNavigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="fluid-container h-fluid-md flex items-center justify-between">
          <div className="flex items-center gap-fluid-sm">
            <Suspense fallback={
              <div className="flex items-center gap-fluid-sm min-w-0">
                <div className="w-fluid-sm h-fluid-sm bg-muted rounded-md animate-pulse flex-shrink-0" />
              </div>
            }>
              <PortfolioAwareHomeButton className="flex items-center gap-fluid-sm min-w-0" />
            </Suspense>
            
            <Suspense fallback={
              <div className="flex items-center gap-1">
                <div className="w-fluid-sm h-fluid-sm bg-muted rounded animate-pulse md:hidden" />
                <div className="hidden md:flex items-center gap-1">
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            }>
              <PortfolioAwareNavigation />
            </Suspense>
          </div>

          <div className="flex items-center gap-fluid-sm md:gap-fluid-md flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="fluid-container py-fluid-md">
        {children}
      </main>
    </div>
  )
}