'use client'

import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CrownIcon, MapIcon, UserIcon, HomeIcon, FileTextIcon, DollarSignIcon } from 'lucide-react'

interface GlobalProLookupSettingsProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  usage?: {
    used: number
    limit: number
    tier: 'free' | 'pro'
    resetDate?: string
  } | null
}

export function GlobalProLookupSettings({ enabled, onToggle, usage }: GlobalProLookupSettingsProps) {
  const remaining = usage ? usage.limit - usage.used : 0
  const usagePercentage = usage ? (usage.used / usage.limit) * 100 : 0
  
  const formatResetDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6">
      <div className="flex items-start gap-6">
        {/* Left Side - Usage Info and Benefits */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Lookup Settings
            </h3>
            {usage && (
              <Badge variant={usage.tier === 'pro' ? 'default' : 'secondary'} className="px-2 py-1">
                <CrownIcon className="h-3 w-3 mr-1" />
                {usage.tier === 'pro' ? 'Pro Tier' : 'Free Tier'}
              </Badge>
            )}
          </div>
          
          {usage && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">
                  {remaining} pro lookups remaining
                </span>
              </div>
              
              {usage.tier === 'free' && (
                <div className="space-y-1">
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {usage.used} of {usage.limit} used
                    {usage.resetDate && (
                      <span className="ml-2">
                        • Resets {formatResetDate(usage.resetDate)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pro Lookup Benefits - Always Visible */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CrownIcon className="h-4 w-4" />
              Pro Lookup Benefits
            </h4>
            
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
          </div>
        </div>
        
        {/* Right Side - Toggle Controls */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {enabled ? 'Pro Mode' : 'Basic Mode'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {enabled ? 'Enhanced data' : 'Address only'}
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="scale-110"
          />
        </div>
      </div>
    </div>
  )
}