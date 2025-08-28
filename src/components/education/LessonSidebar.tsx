'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type LessonMetadata } from '@/lib/education'

interface LessonSection {
  id: string
  title: string
  completed?: boolean
}

interface LessonSidebarProps {
  metadata: LessonMetadata
  sections: LessonSection[]
  activeSection: string
  onSectionClick: (sectionId: string) => void
}

export function LessonSidebar({
  metadata,
  sections,
  activeSection,
  onSectionClick,
}: LessonSidebarProps) {
  const getDifficultyColor = (difficulty?: string) => {
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
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <CardTitle className="text-lg">{metadata.title}</CardTitle>
          <div className="flex gap-2">
            {metadata.difficulty && (
              <Badge
                variant="outline"
                className={cn('text-xs', getDifficultyColor(metadata.difficulty))}
              >
                {metadata.difficulty}
              </Badge>
            )}
            {metadata.duration && (
              <Badge variant="secondary" className="text-xs">
                {metadata.duration}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <nav className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-4">
            Lesson Outline
          </div>
          
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                'w-full text-left flex items-center gap-3 p-2 rounded-md text-sm transition-colors',
                'hover:bg-muted/50',
                activeSection === section.id && 'bg-primary/10 text-primary font-medium'
              )}
            >
              <div className="flex-shrink-0">
                {section.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className={cn(
                    'h-4 w-4',
                    activeSection === section.id ? 'text-primary' : 'text-muted-foreground'
                  )} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  {index + 1}. Section
                </div>
                <div className="leading-tight">
                  {section.title}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Related Calculators */}
        {metadata.relatedCalculators && metadata.relatedCalculators.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Related Tools
            </div>
            <div className="space-y-1">
              {metadata.relatedCalculators.map((calculator) => (
                <Badge key={calculator} variant="outline" className="text-xs">
                  {calculator}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}