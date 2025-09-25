import { SmartNavigation } from '@/components/navigation/SmartNavigation'
import { DebugPanel } from '@/components/education/DebugPanel'

export default function EducationLayout({
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
      
      <DebugPanel />
    </div>
  )
}