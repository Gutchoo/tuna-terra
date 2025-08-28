import { PublicNavigation } from '@/components/navigation/PublicNavigation'

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation sticky />

      <main className="fluid-container py-fluid-md">
        {children}
      </main>
    </div>
  )
}