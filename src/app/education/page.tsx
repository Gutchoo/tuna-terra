'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  FileText, 
  CreditCard,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react'
import { EDUCATION_MODULES, EducationProgress } from '@/lib/education'
import { cn } from '@/lib/utils'

const iconMap = {
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
} as const

export default function EducationHub() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setProgress(EducationProgress.getProgress())

    const handleProgressUpdate = () => {
      setProgress(EducationProgress.getProgress())
    }

    window.addEventListener('educationProgressUpdate', handleProgressUpdate)
    window.addEventListener('educationProgressReset', handleProgressUpdate)

    return () => {
      window.removeEventListener('educationProgressUpdate', handleProgressUpdate)
      window.removeEventListener('educationProgressReset', handleProgressUpdate)
    }
  }, [])

  const getModuleProgress = (moduleId: string) => {
    // For now, return dummy progress since we don't have lessons yet
    // This will be updated when we add actual lessons
    const completedLessons = Object.keys(progress).filter(key => 
      key.startsWith(moduleId) && progress[key]
    ).length
    
    // Current lesson counts by module
    const totalLessons = moduleId === 'cash-flow-analysis' ? 2 : 0 // NOI + Cap Rate lessons
    
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800'
      case 'Advanced':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Real Estate Education
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            Master CCIM-style commercial real estate analysis with interactive lessons 
            and professional-grade calculators.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center gap-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{EDUCATION_MODULES.length} Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>5 Calculators</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Professional Analysis</span>
          </div>
        </motion.div>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {EDUCATION_MODULES.map((module, index) => {
          const Icon = iconMap[module.icon as keyof typeof iconMap]
          const moduleProgress = getModuleProgress(module.id)
          const isAvailable = module.id === 'cash-flow-analysis' // Cash flow analysis module has lessons available
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={cn(
                'group h-full transition-all duration-200 hover:shadow-lg',
                !isAvailable && 'opacity-60'
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg bg-primary/10',
                        !isAvailable && 'bg-muted'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5 text-primary',
                          !isAvailable && 'text-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            getDifficultyColor(module.difficulty)
                          )}
                        >
                          {module.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {module.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  {isAvailable && moduleProgress.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {moduleProgress.completed}/{moduleProgress.total} lessons
                        </span>
                      </div>
                      <Progress value={moduleProgress.percentage} className="h-2" />
                    </div>
                  )}

                  {/* Module Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{module.estimatedTime}</span>
                    <span>{isAvailable ? 'Available' : 'In Development'}</span>
                  </div>

                  {/* Action Button */}
                  {isAvailable ? (
                    <Button asChild className="w-full">
                      <Link href={`/education/noi-fundamentals`}>
                        Start Learning
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-muted/30 rounded-lg p-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Calculators</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access professional-grade calculators for real estate analysis. 
            Use them standalone or embedded within lessons.
          </p>
          <Button asChild size="lg">
            <Link href="/tools">
              Explore Calculators
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center space-y-4"
      >
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto text-sm">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
              1
            </div>
            <p className="font-medium">Start with Fundamentals</p>
            <p className="text-muted-foreground">
              Begin with cap rate analysis to understand property valuation basics.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
              2
            </div>
            <p className="font-medium">Practice with Calculators</p>
            <p className="text-muted-foreground">
              Use interactive tools to reinforce concepts with real-world scenarios.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
              3
            </div>
            <p className="font-medium">Apply Advanced Concepts</p>
            <p className="text-muted-foreground">
              Progress to IRR, NPV, and leverage strategies for sophisticated analysis.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}