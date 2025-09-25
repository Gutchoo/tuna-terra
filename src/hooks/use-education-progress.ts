'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { EducationProgress } from '@/lib/education'

interface EducationProgressData {
  progress: Record<string, boolean>
}

// Query keys
const EDUCATION_PROGRESS_KEY = ['education-progress']

// Fetch user's education progress from API
async function fetchEducationProgress(): Promise<EducationProgressData> {
  const response = await fetch('/api/education/progress')
  if (!response.ok) {
    throw new Error('Failed to fetch education progress')
  }
  return response.json()
}

// Mark lesson complete via API
async function markLessonCompleteAPI(lessonSlug: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/education/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lessonSlug }),
  })
  if (!response.ok) {
    throw new Error('Failed to mark lesson complete')
  }
  return response.json()
}

// Sync localStorage progress to database
async function syncProgressToDatabase(localProgress: Record<string, boolean>): Promise<void> {
  const completedLessons = Object.entries(localProgress)
    .filter(([, completed]) => completed)
    .map(([lessonSlug]) => lessonSlug)

  if (completedLessons.length === 0) return

  // Mark each lesson as complete via API
  await Promise.all(
    completedLessons.map(lessonSlug => markLessonCompleteAPI(lessonSlug))
  )
}

interface User {
  id: string
  email?: string
}

export function useEducationProgress() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser ? { 
        id: currentUser.id, 
        email: currentUser.email 
      } : null)
      setIsLoading(false)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ? { 
        id: session.user.id, 
        email: session.user.email 
      } : null
      
      if (event === 'SIGNED_IN' && newUser && !user) {
        // User just signed in - sync localStorage to database
        const localProgress = EducationProgress.getProgress()
        try {
          await syncProgressToDatabase(localProgress)
          // Invalidate query to refetch from database
          queryClient.invalidateQueries({ queryKey: EDUCATION_PROGRESS_KEY })
        } catch (error) {
          console.warn('Failed to sync education progress:', error)
        }
      }
      
      setUser(newUser)
    })

    return () => subscription.unsubscribe()
  }, [user, supabase.auth, queryClient])

  // Query for database progress (authenticated users only)
  const {
    data: databaseProgress,
    isLoading: isLoadingProgress,
    error: progressError
  } = useQuery({
    queryKey: EDUCATION_PROGRESS_KEY,
    queryFn: fetchEducationProgress,
    enabled: !!user && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation for marking lessons complete
  const markCompleteMutation = useMutation({
    mutationFn: markLessonCompleteAPI,
    onSuccess: (_, lessonSlug) => {
      // Update localStorage immediately for UI responsiveness
      EducationProgress.markComplete(lessonSlug)
      
      // Update query cache
      queryClient.setQueryData(EDUCATION_PROGRESS_KEY, (old: EducationProgressData | undefined) => ({
        progress: {
          ...old?.progress,
          [lessonSlug]: true
        }
      }))
    },
    onError: (error) => {
      console.error('Failed to mark lesson complete:', error)
    }
  })

  // Get current progress (database for authenticated, localStorage for anonymous)
  const getProgress = useCallback((): Record<string, boolean> => {
    if (user && databaseProgress) {
      return databaseProgress.progress
    }
    return EducationProgress.getProgress()
  }, [user, databaseProgress])

  // Check if lesson is complete
  const isComplete = useCallback((lessonSlug: string): boolean => {
    const progress = getProgress()
    return progress[lessonSlug] || false
  }, [getProgress])

  // Mark lesson as complete
  const markComplete = useCallback((lessonSlug: string) => {
    if (user) {
      // Authenticated user - sync to database
      markCompleteMutation.mutate(lessonSlug)
    } else {
      // Anonymous user - use localStorage only
      EducationProgress.markComplete(lessonSlug)
    }
  }, [user, markCompleteMutation])

  // Get module progress
  const getModuleProgress = useCallback((moduleId: string, lessons: { slug: string }[]) => {
    const progress = getProgress()
    const moduleProgress = lessons.filter(lesson => 
      lesson.slug.startsWith(moduleId)
    )
    
    const completed = moduleProgress.filter(lesson => 
      progress[lesson.slug]
    ).length
    
    const total = moduleProgress.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }, [getProgress])

  return {
    // State
    user,
    isLoading: isLoading || isLoadingProgress,
    error: progressError,
    
    // Methods
    getProgress,
    isComplete,
    markComplete,
    getModuleProgress,
    
    // For debugging/admin
    isAuthenticated: !!user,
    hasDatabase: !!databaseProgress,
  }
}