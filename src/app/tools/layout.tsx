import { SmartNavigation } from '@/components/navigation/SmartNavigation'

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />

      <main className="fluid-container py-fluid-md">
        {children}
      </main>
    </div>
  )
}