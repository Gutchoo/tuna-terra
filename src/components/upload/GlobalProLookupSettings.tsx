'use client'

import { ModeToggle } from '@/components/upload/ModeToggle'
import { MapIcon, UserIcon, HomeIcon, FileTextIcon, DollarSignIcon } from 'lucide-react'
import { useUsageData } from '@/hooks/use-user-limits'

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

// Optimized version that can use React Query hooks
export function OptimizedGlobalProLookupSettings({ 
  enabled, 
  onToggle 
}: Omit<GlobalProLookupSettingsProps, 'usage'>) {
  const { data: usage } = useUsageData()
  
  return (
    <GlobalProLookupSettings 
      enabled={enabled}
      onToggle={onToggle}
      usage={usage}
    />
  )
}

export function GlobalProLookupSettings({ enabled, onToggle }: GlobalProLookupSettingsProps) {

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        {/* Toggle Section */}
        <div className="flex items-center">
          <ModeToggle
            enabled={enabled}
            onToggle={onToggle}
          />
        </div>

        {/* Enhanced Data Features Label */}
        <div className="text-right">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Enhanced Data Features
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Available with Pro lookups
          </p>
        </div>
      </div>
      
      {/* Benefits Grid - More compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Column 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
              <MapIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Property Mapping
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Exact boundaries & coordinates
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Owner Information
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Names & mailing addresses
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
              <DollarSignIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Financial Data
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Assessed values & sale history
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
              <HomeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Property Details
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Lot size, year built, stories & units
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center flex-shrink-0">
              <FileTextIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Zoning & Use
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Codes & development restrictions
              </div>
            </div>
          </div>
          
          {/* Empty space for visual balance */}
          <div className="h-[68px]"></div>
        </div>
      </div>
    </div>
  )
}