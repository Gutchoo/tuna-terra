import { AnimatedButton } from '@/components/homepage/ui/AnimatedButton'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
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
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TT</span>
            </div>
            <span className="font-semibold text-lg">Tuna Terra</span>
          </div>
          <div className="flex gap-2">
            <AnimatedButton variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </AnimatedButton>
            <AnimatedButton asChild>
              <Link href="/sign-up">Get Started</Link>
            </AnimatedButton>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <HeroSection />

      {/* Enhanced Features Section */}
      <FeaturesSection />

      {/* Call to Action Section */}
      <CallToActionSection />
    </div>
  )
}
