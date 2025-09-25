'use client'

import { useState, useEffect } from 'react'
import { LessonSidebar } from './LessonSidebar'
import { ProgressTracker } from './ProgressTracker'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { type LessonMetadata } from '@/lib/education'
import { useEducationProgress } from '@/hooks/use-education-progress'
import Link from 'next/link'

interface LessonSection {
  id: string
  title: string
  completed?: boolean
}

interface LessonLayoutProps {
  children: React.ReactNode
  metadata: LessonMetadata
  sections: LessonSection[]
  nextLesson?: { slug: string; title: string }
  prevLesson?: { slug: string; title: string }
  quizCompleted?: boolean
  backHref?: string
  backText?: string
}

export function LessonLayout({
  children,
  metadata,
  sections,
  nextLesson,
  prevLesson,
  quizCompleted = false,
  backHref = '/education',
  backText = 'Back to Education',
}: LessonLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const { isComplete, markComplete, isAuthenticated } = useEducationProgress()
  
  const isCompleted = isComplete(metadata.slug)

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
      }))

      const scrollPosition = window.scrollY + 200
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Check if we're near the bottom of the page (within 100px)
      const isNearBottom = (scrollPosition + windowHeight) >= (documentHeight - 100)

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section.element) {
          // For the last section, activate it if we're near the bottom of the page
          if (i === sectionElements.length - 1 && isNearBottom) {
            setActiveSection(section.id)
            break
          }
          // For other sections, use normal logic
          else if (section.element.offsetTop <= scrollPosition) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const markLessonComplete = () => {
    markComplete(metadata.slug)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const yOffset = -100 // Offset to account for navigation bar height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

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
            <Link href={backHref}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {backText}
            </Link>
          </Button>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 space-y-6">
              <LessonSidebar
                metadata={metadata}
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
              
              <ProgressTracker
                currentLesson={metadata.slug}
                isCompleted={isCompleted}
                onMarkComplete={markLessonComplete}
                isAuthenticated={isAuthenticated}
                quizCompleted={quizCompleted}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Lesson Header */}
              <div className="mb-8 pb-6 border-b">
                <h1 className="text-4xl font-bold mb-4">
                  {metadata.title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {metadata.summary}
                </p>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {children}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                <div>
                  {prevLesson && (
                    <Button variant="outline" asChild>
                      <Link href={`/education/${prevLesson.slug}`}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous: {prevLesson.title}
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="flex gap-4">
                  {!isCompleted && (
                    <Button 
                      onClick={markLessonComplete}
                      disabled={!quizCompleted}
                      variant={quizCompleted ? "default" : "secondary"}
                    >
                      Mark as Complete
                    </Button>
                  )}
                  
                  {nextLesson && (
                    <Button asChild>
                      <Link href={`/education/${nextLesson.slug}`}>
                        Next: {nextLesson.title}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}