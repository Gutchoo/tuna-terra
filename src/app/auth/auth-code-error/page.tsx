'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const description = searchParams.get('description')
  const supabaseError = searchParams.get('supabase_error')
  const message = searchParams.get('message')

  const getErrorMessage = () => {
    if (supabaseError) {
      return `Authentication failed: ${supabaseError}`
    }
    if (error === 'missing_code') {
      return 'The authentication callback was missing required parameters.'
    }
    if (error === 'no_user_data') {
      return 'Authentication succeeded but no user data was returned.'
    }
    if (error === 'unexpected') {
      return `An unexpected error occurred: ${message || 'Unknown error'}`
    }
    if (error && description) {
      return `OAuth error: ${error} - ${description}`
    }
    if (error) {
      return `Authentication error: ${error}`
    }
    return 'Something went wrong during the authentication process.'
  }

  const getRecommendations = () => {
    if (supabaseError?.includes('redirect')) {
      return [
        '• Check if the redirect URL is properly configured in your OAuth provider',
        '• Ensure you\'re using the correct domain for authentication',
        '• Try clearing your browser cache and cookies'
      ]
    }
    if (error === 'access_denied') {
      return [
        '• You may have cancelled the authentication process',
        '• Check if you have access to the Google account you\'re trying to use',
        '• Try again with a different Google account'
      ]
    }
    return [
      '• Network connectivity issues',
      '• Browser security restrictions',
      '• Expired authentication request',
      '• OAuth provider configuration issues'
    ]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This might be due to:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            {getRecommendations().map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
          {(error || supabaseError) && (
            <details className="text-left">
              <summary className="text-sm font-medium cursor-pointer hover:text-foreground">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded text-xs font-mono break-all">
                {error && <div>Error: {error}</div>}
                {description && <div>Description: {description}</div>}
                {supabaseError && <div>Supabase Error: {supabaseError}</div>}
                {message && <div>Message: {message}</div>}
              </div>
            </details>
          )}
          <div className="pt-4">
            <Button onClick={() => router.push('/')} className="w-full">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}