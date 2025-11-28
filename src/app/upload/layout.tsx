import { SmartNavigation } from '@/components/navigation/SmartNavigation'

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
