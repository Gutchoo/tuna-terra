'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TerraLogo } from '@/components/ui/terra-logo'
import { Loader2, XCircle, UserIcon } from 'lucide-react'

interface InvitationDetails {
  email: string
  role: 'editor' | 'viewer'
  invited_at: string
  expires_at: string
  portfolio: {
    id: string
    name: string
    description: string | null
  }
  invited_by: {
    email?: string
    name?: string
  }
}

interface Props {
  token: string
}

export default function InvitationAcceptClient({ token }: Props) {
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })

  const router = useRouter()
  const supabase = createClient()

  // Load invitation details
  useEffect(() => {
    async function loadInvitation() {
      try {
        const response = await fetch(`/api/invitations/${token}/accept`)

        if (response.ok) {
          const data = await response.json()
          setInvitation(data.invitation)
          setFormData(prev => ({ ...prev, email: data.invitation.email }))
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Invalid or expired invitation')
        }
      } catch {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    loadInvitation()
  }, [token])

  const handleAcceptInvitation = useCallback(async () => {
    setAccepting(true)
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/dashboard?portfolio_id=${result.portfolio.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to accept invitation')
      }
    } catch {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }, [token, router])

  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        handleAcceptInvitation()
      }
    }

    if (invitation && !loading) {
      checkAuth()
    }
  }, [invitation, loading, handleAcceptInvitation, supabase.auth])

  const handleAuth = async (mode: 'signin' | 'signup') => {
    setAuthError(null)

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }

    try {
      let result

      if (mode === 'signin') {
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
      } else {
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        })
      }

      if (result.error) {
        setAuthError(result.error.message)
        return
      }

      // If sign in successful or sign up doesn't require confirmation
      if (result.data.user && !result.data.user.email_confirmed_at && mode === 'signup') {
        // Handle email confirmation required
        setError('Please check your email and confirm your account before accepting the invitation.')
        return
      }

      // User is now authenticated, accept the invitation
      await handleAcceptInvitation()

    } catch {
      setAuthError('Authentication failed')
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/invitations/accept/${token}`
        }
      })

      if (error) {
        setAuthError(error.message)
      }
    } catch {
      setAuthError('Google authentication failed')
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'editor'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  if (accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              Accepting invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <TerraLogo className="h-12 w-12" />
          </div>
          <CardTitle>Portfolio Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to collaborate
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {invitation.invited_by.name || invitation.invited_by.email || 'Someone'} invited you to
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-lg">{invitation.portfolio.name}</h3>
              {invitation.portfolio.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invitation.portfolio.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getRoleColor(invitation.role)}`}>
                {invitation.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Expires {formatDate(invitation.expires_at)}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              {invitation.role === 'editor'
                ? 'You&apos;ll be able to view, add, edit, and delete properties.'
                : 'You&apos;ll have read-only access to view all properties.'
              }
            </div>
          </div>

          {/* Auth Forms */}
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  onClick={() => handleAuth('signin')}
                  className="w-full"
                  disabled={!formData.password}
                >
                  Sign In & Accept Invitation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                  />
                </div>

                <Button
                  onClick={() => handleAuth('signup')}
                  className="w-full"
                  disabled={!formData.name || !formData.password || !formData.confirmPassword}
                >
                  Create Account & Accept Invitation
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Google Auth */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Error Display */}
          {authError && (
            <Alert variant="destructive">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Help Text */}
          <div className="text-center text-xs text-muted-foreground">
            By accepting this invitation, you agree to collaborate on this portfolio.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}