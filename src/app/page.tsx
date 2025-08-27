import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { PublicNavigation } from '@/components/navigation/PublicNavigation'
import { HeroSection } from '@/components/homepage/hero/HeroSection'
import { FeaturesSection } from '@/components/homepage/sections/FeaturesSection'
import { CallToActionSection } from '@/components/homepage/sections/CallToActionSection'

export default async function Home() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      {/* Enhanced Hero Section */}
      <HeroSection />

      {/* Enhanced Features Section */}
      <FeaturesSection />

      {/* Call to Action Section */}
      <CallToActionSection />
    </div>
  )
}
