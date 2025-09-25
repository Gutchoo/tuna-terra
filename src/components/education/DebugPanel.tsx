'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Bug, RefreshCw } from 'lucide-react'
import { useEducationProgress } from '@/hooks/use-education-progress'
import { EducationProgress } from '@/lib/education'
import { useQueryClient } from '@tanstack/react-query'

export function DebugPanel() {
  const { getProgress, isAuthenticated } = useEducationProgress()
  const [isClearing, setIsClearing] = useState(false)
  const queryClient = useQueryClient()
  
  // Only show in development when test data is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DATA === 'false') {
    return null
  }

  const currentProgress = getProgress()
  const progressEntries = Object.entries(currentProgress).filter(([, completed]) => completed)

  const clearAllProgress = async () => {
    setIsClearing(true)
    try {
      console.log('🧹 Starting complete progress reset...')
      
      // Step 1: Clear localStorage immediately
      console.log('🧹 Clearing localStorage...')
      EducationProgress.resetProgress()
      
      // Step 2: Clear React Query cache immediately
      console.log('🧹 Clearing React Query cache...')
      await queryClient.cancelQueries({ queryKey: ['education-progress'] })
      queryClient.removeQueries({ queryKey: ['education-progress'] })
      queryClient.setQueryData(['education-progress'], { progress: {} })
      
      // Step 3: Clear database if authenticated
      if (isAuthenticated) {
        console.log('🧹 Clearing database...')
        const response = await fetch('/api/education/progress/reset', {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error(`Database reset failed: ${response.statusText}`)
        }
        console.log('🧹 Database cleared successfully')
      }
      
      // Step 4: Invalidate all related queries to force fresh fetch
      console.log('🧹 Invalidating queries...')
      await queryClient.invalidateQueries({ queryKey: ['education-progress'] })
      
      // Step 5: Clear any browser cache for the API endpoint
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
        console.log('🧹 Browser caches cleared')
      }
      
      console.log('✅ Complete progress reset finished!')
      
      // Small delay to ensure all async operations complete
      setTimeout(() => {
        setIsClearing(false)
      }, 500)
      
    } catch (error) {
      console.error('❌ Failed to clear progress:', error)
      alert(`Failed to clear progress: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsClearing(false)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-orange-50 border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <Bug className="h-4 w-4" />
          Debug Panel (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs font-medium text-orange-700 mb-1">
            Auth Status: {isAuthenticated ? 'Authenticated' : 'Anonymous'}
          </div>
          <div className="text-xs font-medium text-orange-700 mb-2">
            Completed Lessons ({progressEntries.length}):
          </div>
          <div className="space-y-1">
            {progressEntries.length === 0 ? (
              <Badge variant="outline" className="text-xs">No lessons completed</Badge>
            ) : (
              progressEntries.map(([lesson]) => (
                <Badge key={lesson} variant="secondary" className="text-xs mr-1 mb-1">
                  {lesson}
                </Badge>
              ))
            )}
          </div>
        </div>
        
        <Button
          onClick={clearAllProgress}
          disabled={isClearing}
          size="sm"
          variant="destructive"
          className="w-full"
        >
          {isClearing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-3 w-3 mr-2" />
              Reset All Progress
            </>
          )}
        </Button>
        
        <div className="text-xs text-orange-600 space-y-1">
          <div>This panel helps test lesson completion. Click &ldquo;Reset All Progress&rdquo; to clear everything.</div>
          <div className="font-medium">📝 Check browser console for detailed reset logs!</div>
        </div>
      </CardContent>
    </Card>
  )
}