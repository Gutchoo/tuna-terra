'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, CheckCircle, Clock, Target, BookOpen } from 'lucide-react'
import { useEducationProgress } from '@/hooks/use-education-progress'
import { cn } from '@/lib/utils'

interface LessonData {
  slug: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  topics: string[]
  calculators?: string[]
}

const LESSONS: LessonData[] = [
  {
    slug: 'noi-fundamentals',
    title: 'NOI and Cash Flow Basics',
    description: 'Understanding Net Operating Income - the foundation of real estate analysis',
    duration: '30 min',
    difficulty: 'Beginner',
    topics: ['Net Operating Income', 'Operating Expenses', 'Vacancy Allowances', 'Cash Flow vs NOI'],
    calculators: ['NOI Calculator']
  },
  {
    slug: 'cap-rate-basics', 
    title: 'Cap Rate Basics',
    description: 'Understand capitalization rates and their role in commercial real estate',
    duration: '20 min',
    difficulty: 'Beginner',
    topics: ['Capitalization Rates', 'Property Valuation', 'Risk vs Return', 'Market Analysis'],
    calculators: ['Cap Rate Calculator']
  },
  {
    slug: 'valuation-methods',
    title: 'Commercial Property Valuation',
    description: 'Learn multiple approaches to valuing commercial real estate properties',
    duration: '35 min', 
    difficulty: 'Intermediate',
    topics: ['Income Approach', 'DCF Analysis', 'Comparable Sales', 'Cost Approach'],
    calculators: ['DCF Calculator', 'Cap Rate Calculator']
  },
  {
    slug: 'debt-service-financing',
    title: 'Debt Service & Financing',
    description: 'Understanding commercial real estate financing and debt service coverage',
    duration: '40 min',
    difficulty: 'Intermediate', 
    topics: ['DSCR Analysis', 'LTV Ratios', 'Amortization', 'Interest vs Principal', 'Financing Impact'],
    calculators: ['DSCR Calculator', 'Loan Calculator']
  },
  {
    slug: 'capital-expenditures',
    title: 'Capital Expenditures & Reserves',
    description: 'Managing capital improvements and reserve requirements in real estate',
    duration: '30 min',
    difficulty: 'Intermediate',
    topics: ['CapEx vs OpEx', 'Reserve Planning', 'Capital Improvement ROI', 'Timing Strategies'],
    calculators: ['Cash Flow Calculator']
  },
  {
    slug: 'depreciation-tax',
    title: 'Depreciation & Tax Benefits', 
    description: 'Navigate depreciation schedules and tax advantages in commercial real estate',
    duration: '35 min',
    difficulty: 'Advanced',
    topics: ['MACRS Depreciation', 'Cost Segregation', 'Depreciation Recapture', 'Tax Shield Benefits'],
    calculators: ['Tax Analysis Calculator']
  },
  {
    slug: 'proforma-analysis',
    title: 'Pro Forma Analysis',
    description: 'Create comprehensive multi-year projections and investment analysis',
    duration: '45 min',
    difficulty: 'Advanced', 
    topics: ['Multi-Year Projections', 'Growth Assumptions', 'Exit Strategies', 'Terminal Value'],
    calculators: ['Pro Forma Calculator', 'IRR Calculator']
  }
]


export default function CommercialRealEstateBasicsModule() {
  const { getProgress, isComplete } = useEducationProgress()
  
  // Calculate module progress (only count available lessons)
  const progress = getProgress()
  const availableLessons = LESSONS.slice(0, 2) // Only first 2 lessons are available
  const completedLessons = availableLessons.filter(lesson => progress[lesson.slug]).length
  const totalAvailableLessons = availableLessons.length
  const progressPercentage = totalAvailableLessons > 0 ? Math.round((completedLessons / totalAvailableLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Education Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/education">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Education
            </Link>
          </Button>
        </motion.div>

        {/* Module Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Commercial Real Estate Basics</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master the fundamentals of commercial real estate analysis, from NOI calculations 
            to advanced pro forma modeling and tax strategies.
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-muted/30 dark:bg-muted/60 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Your Progress</h2>
              <p className="text-muted-foreground">
                {completedLessons} of {totalAvailableLessons} lessons completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{totalAvailableLessons} Available • {LESSONS.length - totalAvailableLessons} Coming Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>~55 Minutes Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Foundation Level</span>
            </div>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((lesson, index) => {
            const isCompleted = isComplete(lesson.slug)
            const isAvailable = index < 2 // Only first 2 lessons (NOI and Cap Rate) are available
            
            return (
              <motion.div
                key={lesson.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "group h-full transition-all duration-200",
                  isAvailable ? "hover:shadow-lg" : "opacity-60"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          Lesson {index + 1}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!isAvailable && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isAvailable ? (
                      <Link href={`/education/${lesson.slug}`}>
                        <CardTitle className="text-lg transition-colors group-hover:text-primary cursor-pointer">
                          {lesson.title}
                        </CardTitle>
                      </Link>
                    ) : (
                      <CardTitle className="text-lg transition-colors text-muted-foreground">
                        {lesson.title}
                      </CardTitle>
                    )}
                    <CardDescription className="text-sm">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Duration */}
                    <div className={cn(
                      "flex items-center gap-2 text-sm",
                      isAvailable ? "text-muted-foreground" : "text-muted-foreground/60"
                    )}>
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration}</span>
                    </div>

                    {/* Topics */}
                    <div>
                      <div className={cn(
                        "text-sm font-medium mb-2",
                        !isAvailable && "text-muted-foreground"
                      )}>
                        Topics Covered:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {lesson.topics.slice(0, 3).map((topic) => (
                          <Badge 
                            key={topic} 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              !isAvailable && "opacity-60"
                            )}
                          >
                            {topic}
                          </Badge>
                        ))}
                        {lesson.topics.length > 3 && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              !isAvailable && "opacity-60"
                            )}
                          >
                            +{lesson.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Calculators */}
                    {lesson.calculators && lesson.calculators.length > 0 && (
                      <div>
                        <div className={cn(
                          "text-sm font-medium mb-2",
                          !isAvailable && "text-muted-foreground"
                        )}>
                          Interactive Tools:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lesson.calculators.map((calculator) => (
                            <Badge 
                              key={calculator} 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                !isAvailable && "opacity-60"
                              )}
                            >
                              {calculator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {isAvailable ? (
                      <Button asChild className="w-full mt-4" variant={isCompleted ? "outline" : "default"}>
                        <Link href={`/education/${lesson.slug}`}>
                          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full mt-4">
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Recommended Learning Path</h2>
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto text-sm">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
                1
              </div>
              <p className="font-medium">Foundation (Lessons 1-2)</p>
              <p className="text-muted-foreground">
                Start with NOI and Cap Rate fundamentals to build your base knowledge.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
                2
              </div>
              <p className="font-medium">Core Analysis (Lessons 3-5)</p>
              <p className="text-muted-foreground">
                Learn valuation methods, financing, and capital expenditure planning.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mx-auto">
                3
              </div>
              <p className="font-medium">Advanced Topics (Lessons 6-7)</p>
              <p className="text-muted-foreground">
                Master tax strategies and comprehensive pro forma analysis.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}