'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserIcon, 
  CalendarIcon, 
  ShieldIcon, 
  SaveIcon,
  BuildingIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface ProfileStats {
  portfolios_owned: number
  portfolios_shared: number
  total_properties: number
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [nameError, setNameError] = useState('')
  const [initialName, setInitialName] = useState('')
  
  const supabase = createClient()

  // Check if there are unsaved changes
  const hasChanges = () => {
    return fullName.trim() !== initialName
  }

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUser(user)
        const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
        
        setFullName(name)
        setInitialName(name)

        // Load profile data from API
        await loadUserProfile()

      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [supabase.auth])

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      
      const data = await response.json()
      setStats(data.stats)
      
      // Update user data from API if available
      if (data.user) {
        setFullName(data.user.full_name || '')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const validateForm = () => {
    let isValid = true
    
    // Reset errors
    setNameError('')
    setMessage(null)
    
    // Validate full name
    if (!fullName.trim()) {
      setNameError('Full name is required')
      isValid = false
    } else if (fullName.trim().length < 2) {
      setNameError('Full name must be at least 2 characters')
      isValid = false
    } else if (fullName.trim().length > 50) {
      setNameError('Full name must be less than 50 characters')
      isValid = false
    }
    
    return isValid
  }

  const handleSaveProfile = async () => {
    if (!user) return

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      // Update profile via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const data = await response.json()

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          full_name: data.user.full_name
        }
      } : null)
      
      // Update initial values to reflect saved state
      setInitialName(data.user.full_name)

    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile'
      })
    } finally {
      setSaving(false)
    }
  }


  const getLoginMethods = (user: User): string[] => {
    const providers = new Set<string>()
    
    // Check primary provider
    const provider = user.app_metadata?.provider
    if (provider) {
      switch (provider) {
        case 'google':
          providers.add('Google')
          break
        case 'email':
          providers.add('Email')
          break
        default:
          providers.add(provider.charAt(0).toUpperCase() + provider.slice(1))
      }
    }
    
    // Check for linked identities (additional providers)
    if (user.identities) {
      user.identities.forEach(identity => {
        switch (identity.provider) {
          case 'google':
            providers.add('Google')
            break
          case 'email':
            providers.add('Email')
            break
          default:
            if (identity.provider !== provider) { // Don't duplicate primary provider
              providers.add(identity.provider.charAt(0).toUpperCase() + identity.provider.slice(1))
            }
        }
      })
    }
    
    return Array.from(providers).sort()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to access your account settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account preferences
          </p>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (nameError) setNameError('') // Clear error on change
                }}
                placeholder="Enter your full name"
                className={nameError ? 'border-destructive' : ''}
                maxLength={50}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {fullName.length}/50 characters
              </p>
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <Badge variant="secondary">Locked</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Your email cannot be changed after account creation
              </p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={saving || !hasChanges() || !!nameError} 
              className="w-full"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : hasChanges() ? 'Save Changes' : 'No Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">LOGIN METHOD{getLoginMethods(user).length > 1 ? 'S' : ''}</Label>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getLoginMethods(user).map(method => (
                      <Badge key={method} variant="outline">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">ACCOUNT STATUS</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground">MEMBER SINCE</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(user.created_at || '')}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">LAST SIGN IN</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {stats.portfolios_owned}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Portfolios Owned
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.portfolios_shared}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Shared Access
                    </div>
                  </div>

                  <div className="col-span-2 text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.total_properties}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Properties
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-4 w-24 bg-muted rounded mx-auto mb-2" />
                    <div className="h-3 w-32 bg-muted rounded mx-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}