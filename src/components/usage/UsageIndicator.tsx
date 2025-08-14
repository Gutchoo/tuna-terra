'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import type { UserLimits } from '@/lib/supabase'

interface UsageIndicatorProps {
  compact?: boolean
  showTier?: boolean
}

export function UsageIndicator({ compact = false, showTier = true }: UsageIndicatorProps) {
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserLimits = async () => {
      try {
        const response = await fetch('/api/user/limits')
        if (!response.ok) {
          throw new Error('Failed to load usage info')
        }
        
        const data = await response.json()
        setUserLimits(data.limits)
      } catch (error) {
        console.error('Error loading user limits:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadUserLimits()
  }, [])

  const formatResetDate = (dateString: string) => {
    const resetDate = new Date(dateString)
    const now = new Date()
    const diffTime = resetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 7) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
    }
    
    return resetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getUsagePercentage = () => {
    if (!userLimits) return 0
    const percentage = (userLimits.property_lookups_used / userLimits.property_lookups_limit) * 100
    return Math.min(percentage, 100)
  }

  const getProgressColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageStatus = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'critical'
    if (percentage >= 70) return 'warning'
    return 'healthy'
  }

  const getRemainingLookups = () => {
    if (!userLimits) return 0
    return Math.max(0, userLimits.property_lookups_limit - userLimits.property_lookups_used)
  }

  const isNearLimit = () => {
    return getUsagePercentage() >= 80
  }

  const isAtLimit = () => {
    return getRemainingLookups() === 0
  }

  if (loading) {
    if (compact) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/50 rounded-lg animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      )
    }
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded" />
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !userLimits) {
    return null // Fail silently - don't block the page
  }

  if (compact) {
    return (
      <div className="px-3 py-2 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          {showTier && (
            <Badge variant={userLimits.tier === 'pro' ? 'default' : 'secondary'} className="text-xs font-medium">
              {userLimits.tier === 'pro' ? 'Pro' : 'Free'} Tier
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {userLimits.tier === 'pro' ? (
              'Unlimited lookups'
            ) : (
              <>
                <span className={getUsageStatus() === 'critical' ? 'text-red-600 font-medium' : 'text-foreground font-medium'}>
                  {getRemainingLookups()} property lookups remaining
                </span>
                {getUsageStatus() === 'critical' && (
                  <span className="ml-1 text-xs text-red-600">
                    (Low)
                  </span>
                )}
              </>
            )}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showTier && (
                <Badge variant={userLimits.tier === 'pro' ? 'default' : 'secondary'}>
                  {userLimits.tier === 'pro' ? 'Pro Tier' : 'Free Tier'}
                </Badge>
              )}
            </div>
            {userLimits.tier === 'free' && (
              <Badge variant="outline" className="text-xs">
                Pro: Unlimited Lookups
              </Badge>
            )}
          </div>

          {userLimits.tier !== 'pro' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Property Lookups: {userLimits.property_lookups_used} / {userLimits.property_lookups_limit}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getRemainingLookups()} remaining
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={getUsagePercentage()} 
                  max={100}
                  aria-label={`Property lookup usage: ${userLimits.property_lookups_used} of ${userLimits.property_lookups_limit} used`}
                  aria-describedby="usage-details"
                  className="h-2"
                />
                <div 
                  className={`absolute inset-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${getUsagePercentage()}%` }}
                />
                <div id="usage-details" className="sr-only">
                  {getRemainingLookups()} lookups remaining until {formatResetDate(userLimits.reset_date)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Resets {formatResetDate(userLimits.reset_date)}</span>
                <span>{getUsagePercentage().toFixed(0)}% used</span>
              </div>
            </div>
          )}

          {isAtLimit() && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve reached your monthly lookup limit. Usage will reset on the 1st of next month.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit() && !isAtLimit() && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                You&apos;re approaching your monthly lookup limit. Consider upgrading to Pro for unlimited lookups.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}