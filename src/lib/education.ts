// import { type MDXProps } from 'mdx/types'

export interface LessonMetadata {
  title: string
  summary: string
  order: number
  relatedCalculators: string[]
  slug: string
  duration?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface ModuleMetadata {
  id: string
  title: string
  description: string
  icon: string
  lessons: LessonMetadata[]
  estimatedTime: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

// Progress tracking using localStorage
export class EducationProgress {
  private static STORAGE_KEY = 'education-progress'

  static getProgress(): Record<string, boolean> {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  static markComplete(lessonSlug: string): void {
    if (typeof window === 'undefined') return
    const progress = this.getProgress()
    progress[lessonSlug] = true
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress))
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('educationProgressUpdate', {
      detail: { lessonSlug, completed: true }
    }))
  }

  static isComplete(lessonSlug: string): boolean {
    return this.getProgress()[lessonSlug] || false
  }

  static getModuleProgress(moduleId: string, lessons: LessonMetadata[]): {
    completed: number
    total: number
    percentage: number
  } {
    const moduleProgress = lessons.filter(lesson => 
      lesson.slug.startsWith(moduleId)
    )
    
    const completed = moduleProgress.filter(lesson => 
      this.isComplete(lesson.slug)
    ).length
    
    const total = moduleProgress.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  static resetProgress(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('educationProgressReset'))
  }
}

// Lesson discovery and metadata management
export class LessonRegistry {
  private static lessons: Map<string, LessonMetadata> = new Map()
  
  static register(slug: string, metadata: LessonMetadata): void {
    this.lessons.set(slug, { ...metadata, slug })
  }
  
  static get(slug: string): LessonMetadata | undefined {
    return this.lessons.get(slug)
  }
  
  static getAll(): LessonMetadata[] {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order)
  }
  
  static getByModule(moduleId: string): LessonMetadata[] {
    return this.getAll().filter(lesson => lesson.slug.startsWith(moduleId))
  }
}

// Module definitions
export const EDUCATION_MODULES: ModuleMetadata[] = [
  {
    id: 'commercial-real-estate-basics',
    title: 'Commercial Real Estate Basics',
    description: 'Master commercial real estate fundamentals: valuation, financing, capital expenditures, and tax strategies.',
    icon: 'DollarSign',
    lessons: [],
    estimatedTime: '4 hours',
    difficulty: 'Beginner',
  },
  {
    id: 'market-fundamentals',
    title: 'Market Fundamentals',
    description: 'Understanding real estate markets, analysis frameworks, and investment fundamentals.',
    icon: 'TrendingUp',
    lessons: [],
    estimatedTime: '45 min',
    difficulty: 'Beginner',
  },
  {
    id: 'valuation-tools',
    title: 'Time Value of Money',
    description: 'Master present value, future value, and time-based financial calculations.',
    icon: 'Clock',
    lessons: [],
    estimatedTime: '60 min',
    difficulty: 'Intermediate',
  },
  {
    id: 'tax-strategy',
    title: 'Tax Strategy',
    description: 'Navigate depreciation, 1031 exchanges, and tax-efficient investment structures.',
    icon: 'FileText',
    lessons: [],
    estimatedTime: '75 min',
    difficulty: 'Advanced',
  },
  {
    id: 'financing-leverage',
    title: 'Financing & Leverage',
    description: 'Understand DSCR, loan structures, and leverage strategies for real estate.',
    icon: 'CreditCard',
    lessons: [],
    estimatedTime: '80 min',
    difficulty: 'Advanced',
  },
]

// Calculator registry for embedding in lessons
export const AVAILABLE_CALCULATORS = {
  'cap-rate': {
    name: 'Cap Rate Calculator',
    description: 'Calculate capitalization rates and property values',
    component: 'CapRateCalculator',
  },
  'noi': {
    name: 'NOI Calculator',
    description: 'Analyze net operating income with waterfall breakdown',
    component: 'NOICalculator',
  },
  'tvm': {
    name: 'Time Value of Money',
    description: 'Present value, future value, and payment calculations',
    component: 'TVMCalculator',
  },
  'irr-npv': {
    name: 'IRR & NPV Analysis',
    description: 'Internal rate of return and net present value analysis',
    component: 'IRRNPVCalculator',
  },
  'dscr': {
    name: 'DSCR Calculator',
    description: 'Debt service coverage ratio and loan analysis',
    component: 'DSCRCalculator',
  },
} as const

export type CalculatorType = keyof typeof AVAILABLE_CALCULATORS

// MDX components for calculator embedding
export interface CalculatorEmbedProps {
  title?: string
  description?: string
  className?: string
}

// Utility functions
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner': return 'text-green-600 bg-green-50 border-green-200'
    case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'Advanced': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}