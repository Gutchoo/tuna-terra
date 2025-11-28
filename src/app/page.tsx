import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { SmartNavigation } from '@/components/navigation/SmartNavigation'
import { HeroSection } from '@/components/homepage/hero/HeroSection'
import { FeaturesSection } from '@/components/homepage/sections/FeaturesSection'
import { CallToActionSection } from '@/components/homepage/sections/CallToActionSection'
import { AuthDebugPanel } from '@/components/homepage/AuthDebugPanel'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />

      {/* Enhanced Hero Section */}
      <HeroSection />

      {/* Enhanced Features Section */}
      <FeaturesSection />

      {/* Call to Action Section */}
      <CallToActionSection />

      {/* Auth Debug Panel - Dev Only */}
      <AuthDebugPanel />
    </div>
  )
}
