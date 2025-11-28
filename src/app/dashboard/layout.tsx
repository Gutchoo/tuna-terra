import { SmartNavigation } from '@/components/navigation/SmartNavigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />

      {/* Main content */}
      <main className="fluid-container py-fluid-md">
        {children}
      </main>
    </div>
  )
}
