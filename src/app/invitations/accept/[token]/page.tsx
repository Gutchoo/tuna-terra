import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getUserId } from '@/lib/auth'
import InvitationAcceptClient from './InvitationAcceptClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function AcceptInvitationPage({ params }: Props) {
  const { token } = await params
  const userId = await getUserId()

  // If user is authenticated, handle invitation acceptance server-side
  if (userId) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Cookie': (await cookies()).toString(),
        },
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to the shared portfolio
        redirect(`/dashboard?portfolio_id=${result.portfolio.id}`)
      } else {
        // Let client handle the error
      }
    } catch (error) {
      console.error('Server-side invitation acceptance error:', error)
      // Fall through to client-side handling
    }
  }

  // For unauthenticated users or error cases, render client component
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvitationAcceptClient token={token} />
    </Suspense>
  )
}