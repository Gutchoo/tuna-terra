'use client'
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
import { EDUCATION_MODULES } from '@/lib/education'
import { useEducationProgress } from '@/hooks/use-education-progress'
import { cn } from '@/lib/utils'

const iconMap = {
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
} as const

export default function EducationHub() {
  const { getProgress } = useEducationProgress()

  const getModuleProgressData = (moduleId: string) => {
    // Map of modules to their actual lesson slugs (only available lessons)
    const moduleToLessons: Record<string, string[]> = {
      'commercial-real-estate-basics': [
        'noi-fundamentals', 
        'cap-rate-fundamentals'
        // Other lessons coming soon: valuation-methods, debt-service-financing, capital-expenditures, depreciation-tax, proforma-analysis
      ],
      // Add other modules here when they have lessons
    }
    
    const lessonSlugs = moduleToLessons[moduleId] || []
    
    if (lessonSlugs.length === 0) {
      return {
        completed: 0,
        total: 0,
        percentage: 0
      }
    }
    
    // Calculate progress directly without using the hook's filtering logic
    const progress = getProgress()
    const completed = lessonSlugs.filter(slug => progress[slug]).length
    const total = lessonSlugs.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
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
            Master commercial real estate analysis with interactive lessons 
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
          const moduleProgress = getModuleProgressData(module.id)
          const isAvailable = module.id === 'commercial-real-estate-basics' // Commercial real estate basics module has lessons available
          
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
                    </div>
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    {isAvailable ? (
                      <Link href={`/education/commercial-real-estate-basics`}>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors cursor-pointer">
                          {module.title}
                        </CardTitle>
                      </Link>
                    ) : (
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                    )}
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
                        <span className="text-muted-foreground">
                          {moduleProgress.completed === moduleProgress.total ? 'Completed' : 'Progress'}
                        </span>
                        <span className="font-medium">
                          {moduleProgress.completed}/{moduleProgress.total} lessons
                        </span>
                      </div>
                      <Progress value={moduleProgress.percentage} className="h-2" />
                    </div>
                  )}


                  {/* Action Button */}
                  {isAvailable ? (
                    <Button asChild className="w-full" variant={moduleProgress.completed > 0 ? "outline" : "default"}>
                      <Link href={`/education/commercial-real-estate-basics`}>
                        {moduleProgress.completed === 0 
                          ? 'Start Learning'
                          : moduleProgress.completed === moduleProgress.total 
                            ? 'Review Module' 
                            : 'Continue Learning'
                        }
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
        className="bg-muted/30 dark:bg-muted/60 rounded-lg p-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Calculators</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access professional-grade calculators for real estate analysis. 
            Use them standalone or embedded within lessons.
          </p>
          <Button asChild size="lg">
            <Link href="/financial-modeling">
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