import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { SmartNavigation } from '@/components/navigation/SmartNavigation'
import { HomepageContent } from '@/components/homepage/HomepageContent'
import { AuthDebugPanel } from '@/components/homepage/AuthDebugPanel'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <SmartNavigation />
      <HomepageContent />
      <AuthDebugPanel />
    </div>
  )
}
