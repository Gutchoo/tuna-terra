'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Trophy, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
// import { cn } from '@/lib/utils'

interface ProgressTrackerProps {
  currentLesson: string
  isCompleted: boolean
  onMarkComplete: () => void
  isAuthenticated?: boolean
  quizCompleted?: boolean
}

export function ProgressTracker({
  isCompleted,
  onMarkComplete,
  isAuthenticated = false,
  quizCompleted = false,
}: ProgressTrackerProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Completion Button */}
        {!isCompleted && (
          <div className="space-y-2">
            <Button
              onClick={onMarkComplete}
              className="w-full"
              size="sm"
              disabled={!quizCompleted}
              variant={quizCompleted ? "default" : "secondary"}
            >
              Mark as Complete
            </Button>
            {!quizCompleted && (
              <p className="text-xs text-muted-foreground text-center">
                Complete the quiz at the end of the lesson to mark as complete
              </p>
            )}
          </div>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="text-2xl">🎉</div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              Great job! You&apos;ve completed this lesson
            </div>
          </motion.div>
        )}

        {/* Sign-up incentive for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t space-y-3"
          >
            <div className="text-center space-y-2">
              <UserPlus className="h-5 w-5 text-muted-foreground mx-auto" />
              <div className="text-sm font-medium">Save Your Progress</div>
              <div className="text-xs text-muted-foreground">
                Create an account to track your progress across devices and never lose your achievements.
              </div>
            </div>
            <Button asChild size="sm" className="w-full">
              <Link href={`/sign-up?returnTo=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : encodeURIComponent('/education')}`}>
                Create Account
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Learning Path */}
        {isAuthenticated && (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground text-center">
              Continue your learning journey with advanced topics
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}