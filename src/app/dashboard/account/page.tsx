'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  UserIcon,
  CalendarIcon,
  ShieldIcon,
  SaveIcon,
  BuildingIcon,
  SearchIcon,
  InfoIcon,
  MapIcon,
  HomeIcon,
  FileTextIcon,
  DollarSignIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserLimits } from '@/lib/supabase'

interface ProfileStats {
  portfolios_owned: number
  portfolios_shared: number
  total_properties: number
}

function AccountPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [nameError, setNameError] = useState('')
  const [initialName, setInitialName] = useState('')
  const [showProInfoModal, setShowProInfoModal] = useState(false)

  const supabase = createClient()

  // Check if there are unsaved changes
  const hasChanges = () => {
    return fullName.trim() !== initialName
  }

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadUserLimits = async () => {
    try {
      const response = await fetch('/api/user/limits')
      if (!response.ok) {
        throw new Error('Failed to load user limits')
      }

      const data = await response.json()
      setUserLimits(data.limits)
    } catch (error) {
      console.error('Error loading user limits:', error)
    }
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

        // Extract name from user metadata (first/last name from signup or full_name from OAuth)
        const firstName = user.user_metadata?.first_name || ''
        const lastName = user.user_metadata?.last_name || ''

        let name = ''
        if (firstName && lastName) {
          name = `${firstName} ${lastName}`
        } else if (user.user_metadata?.full_name) {
          name = user.user_metadata.full_name
        } else if (firstName) {
          name = firstName
        }

        setFullName(name)
        setInitialName(name)

        // Load profile data from API
        await loadUserProfile()
        await loadUserLimits()

      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, []) // Remove problematic dependencies



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

  const formatResetDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getUsagePercentage = () => {
    if (!userLimits) return 0
    const percentage = (userLimits.property_lookups_used / userLimits.property_lookups_limit) * 100
    return Math.min(percentage, 100)
  }

  const ProLookupModal = () => (
    <Dialog open={showProInfoModal} onOpenChange={setShowProInfoModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Pro Lookup Benefits
          </DialogTitle>
          <DialogDescription>
            Unlock comprehensive property data with detailed property information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-3">
              <MapIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Property Mapping</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Exact boundaries & coordinates</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Owner Information</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Names & mailing addresses</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSignIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Financial Data</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Assessed values & sale history</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HomeIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Property Details</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Lot size, year built, stories & units</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileTextIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Zoning & Use</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Codes & development restrictions</span>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button className="w-full" disabled>
              Pro Tier Coming Soon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">

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
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to access your account settings.</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">


        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
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
                <Label htmlFor="fullName">Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (nameError) setNameError('') // Clear error on change
                  }}
                  placeholder="Enter your name"
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

            {/* Account Tier & Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SearchIcon className="h-5 w-5" />
                    Account Tier & Usage
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => setShowProInfoModal(true)}
                      >
                        <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">What are Pro lookups?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>What are Pro lookups?</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Property lookup limits and usage tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CURRENT TIER</Label>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {userLimits?.tier === 'pro' ? (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Pro Tier
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Free Tier
                        </Badge>
                      )}
                      {userLimits?.tier === 'free' && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon: Pro
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">PROPERTY LOOKUPS</Label>
                    <div className="mt-1">
                      <div className="text-sm font-medium">
                        {userLimits ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {userLimits.property_lookups_used} / {userLimits.tier === 'pro' ? '∞' : userLimits.property_lookups_limit} used
                            </span>
                            {userLimits.tier !== 'pro' && userLimits.property_lookups_used >= userLimits.property_lookups_limit && (
                              <Badge variant="destructive" className="text-xs">
                                None Left
                              </Badge>
                            )}
                            {userLimits.tier !== 'pro' && userLimits.property_lookups_used < userLimits.property_lookups_limit && getUsagePercentage() >= 90 && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        ) : (
                          'Loading...'
                        )}
                      </div>
                      {userLimits && userLimits.tier !== 'pro' && (
                        <div className="w-full bg-muted rounded-full h-2 mt-2 relative overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getUsagePercentage() >= 90 ? 'bg-red-500' :
                              getUsagePercentage() >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                            style={{ width: `${getUsagePercentage()}%` }}
                            role="progressbar"
                            aria-valuenow={getUsagePercentage()}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Property lookup usage: ${userLimits.property_lookups_used} of ${userLimits.property_lookups_limit} used`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Resets {userLimits ? formatResetDate(userLimits.reset_date) : '...'}
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
      <ProLookupModal />
    </TooltipProvider>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading account...</div>}>
      <AccountPageContent />
    </Suspense>
  )
}