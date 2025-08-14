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
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
            <Suspense fallback={
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 bg-muted rounded-md animate-pulse flex-shrink-0" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse hidden sm:block" />
              </div>
            }>
              <PortfolioAwareHomeButton className="flex items-center gap-2 min-w-0" />
            </Suspense>
            <Suspense fallback={
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 bg-muted rounded animate-pulse md:hidden" />
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

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Settings button disabled - page not implemented yet */}
            {/* 
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Link>
            </Button>
            */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}