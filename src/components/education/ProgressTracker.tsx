'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
// import { cn } from '@/lib/utils'

interface ProgressTrackerProps {
  currentLesson: string
  isCompleted: boolean
  onMarkComplete: () => void
}

export function ProgressTracker({
  isCompleted,
  onMarkComplete,
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
        {/* Current Lesson Status */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <motion.div
            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </motion.div>
          
          <div className="flex-1">
            <div className="text-sm font-medium">
              {isCompleted ? 'Completed!' : 'In Progress'}
            </div>
            <div className="text-xs text-muted-foreground">
              Current Lesson
            </div>
          </div>
        </div>

        {/* Completion Button */}
        {!isCompleted && (
          <Button
            onClick={onMarkComplete}
            className="w-full"
            size="sm"
          >
            Mark as Complete
          </Button>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="text-2xl">🎉</div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              Great job!
            </div>
            <div className="text-xs text-muted-foreground">
              You&apos;ve completed this lesson
            </div>
          </motion.div>
        )}

        {/* Overall Progress Placeholder */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            Module Progress
          </div>
          <div className="text-xs text-muted-foreground">
            1 of 5 lessons completed
          </div>
          <div className="mt-2 bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-1/5 transition-all duration-300" />
          </div>
        </div>

        {/* Learning Path */}
        <div className="pt-2">
          <div className="text-xs text-muted-foreground text-center">
            Continue your learning journey with advanced topics
          </div>
        </div>
      </CardContent>
    </Card>
  )
}