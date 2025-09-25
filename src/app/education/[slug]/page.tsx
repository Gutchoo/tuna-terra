'use client'

import { LessonLayout } from '@/components/education/LessonLayout'
import { CapRateCalculator } from '@/components/calculators/CapRateCalculator'
import { NOICalculator } from '@/components/calculators/NOICalculator'
import { LessonQuiz } from '@/components/education/LessonQuiz'
import { MotionWrapper } from '@/components/education/MotionWrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Lightbulb, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { use, useState } from 'react'
import { useEducationProgress } from '@/hooks/use-education-progress'
import { tunasTowerApartments, generateYearlyProjections } from '@/lib/education/examples'
import 'katex/dist/katex.min.css'

// Helper function to format currency
const formatCurrency = (amount: number, showParens: boolean = false): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
  
  if (amount < 0 && showParens) {
    return `(${formatted})`
  }
  return amount < 0 ? `-${formatted}` : formatted
}

// Helper function to format percentage
const formatPercentage = (decimal: number): string => {
  return `${(decimal * 100).toFixed(1)}%`
}

// Available lessons
const lessons = {
  'cap-rate-basics': {
    metadata: {
      title: 'Cap Rate Basics',
      summary: 'Understand capitalization rates and their role in commercial real estate',
      order: 1,
      relatedCalculators: ['Cap Rate Calculator'],
      slug: 'cap-rate-basics',
      duration: '20 min',
      difficulty: 'Beginner' as const,
    },
    sections: [
      { id: 'concept', title: 'What is Cap Rate?', completed: false },
      { id: 'why-matters', title: 'Why Cap Rates Matter', completed: false },
      { id: 'formula', title: 'The Simple Formula', completed: false },
      { id: 'example', title: 'Continued Example', completed: false },
      { id: 'calculator', title: 'Interactive Calculator', completed: false },
      { id: 'market-reading', title: 'Reading the Market', completed: false },
      { id: 'takeaways', title: 'Key Takeaways', completed: false },
      { id: 'quiz', title: 'Knowledge Check', completed: false },
    ],
  },
  'noi-fundamentals': {
    metadata: {
      title: 'NOI and Cash Flow Basics',
      summary: 'Understanding Net Operating Income - the foundation of real estate analysis',
      order: 2,
      relatedCalculators: ['NOI Calculator'],
      slug: 'noi-fundamentals',
      duration: '30 min',
      difficulty: 'Beginner' as const,
    },
    sections: [
      { id: 'concept', title: 'What is NOI?', completed: false },
      { id: 'why-noi-matters', title: 'Why NOI Matters', completed: false },
      { id: 'components', title: 'The NOI Formula Explained', completed: false },
      { id: 'example', title: 'Real-World Example', completed: false },
      { id: 'calculator', title: 'Interactive Calculator', completed: false },
      { id: 'vs-cashflow', title: 'NOI vs Cash Flow', completed: false },
      { id: 'example-continued', title: 'Cash Flow Analysis', completed: false },
      { id: 'takeaways', title: 'Key Takeaways', completed: false },
      { id: 'quiz', title: 'Knowledge Check', completed: false },
    ],
  },
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default function LessonPage({ params }: PageProps) {
  const { slug } = use(params)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const { isComplete } = useEducationProgress()
  
  const lesson = lessons[slug as keyof typeof lessons]
  const isLessonCompleted = isComplete(slug)
  
  // Filter out quiz section if lesson is completed
  const sectionsToShow = isLessonCompleted 
    ? lesson.sections.filter(section => section.id !== 'quiz')
    : lesson.sections
  
  if (!lesson) {
    notFound()
  }

  if (slug === 'noi-fundamentals') {
    // Get example property data and projections
    const property = tunasTowerApartments
    const projections = generateYearlyProjections(property, 3)
    
    return (
      <LessonLayout
        metadata={lesson.metadata}
        sections={sectionsToShow}
        nextLesson={{ slug: "cap-rate-basics", title: "Cap Rate Basics" }}
        prevLesson={undefined}
        quizCompleted={quizCompleted || isLessonCompleted}
        backHref="/education/commercial-real-estate-basics"
        backText="Back to Commercial Real Estate Basics"
      >
        {/* Concept Section */}
        <section id="concept" className="space-y-6 mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              What is NOI?
            </h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    <strong>Net Operating Income (NOI)</strong> is the total income a property generates 
                    from operations minus all operating expenses, before considering financing, taxes, 
                    or capital improvements.
                  </p>
                  
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Simple Analogy:</strong> Think of NOI like a business&apos;s operating profit before 
                      loan payments. It shows how much cash the property itself generates, regardless of how 
                      you financed it.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">NOI Formula:</h4>
                  <div className="text-center text-2xl font-mono bg-white dark:bg-gray-800 p-4 rounded border">
                    NOI = Total Income - Operating Expenses
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Why NOI Matters Section */}
        <section id="why-noi-matters" className="space-y-6 mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Why NOI Matters</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Property Performance Metric
                  </h4>
                  <p className="text-muted-foreground">
                    Shows the true earning power of a property regardless of how it&apos;s financed. 
                    A property with high NOI is a good performer.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Comparison Tool
                  </h4>
                  <p className="text-muted-foreground">
                    Allows apples-to-apples comparison between properties since it excludes 
                    financing differences and focuses on operating performance.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Valuation Foundation
                  </h4>
                  <p className="text-muted-foreground">
                    Used to calculate property value using the formula: Property Value = NOI ÷ Cap Rate. 
                    Higher NOI means higher property value.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Financing Decisions
                  </h4>
                  <p className="text-muted-foreground">
                    Banks use NOI to determine how much they&apos;ll lend. They want to see that 
                    NOI can comfortably cover debt service payments.
                  </p>
                </div>
              </Card>
            </div>
          </MotionWrapper>
        </section>

        {/* Components Section */}
        <section id="components" className="space-y-6 mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">The NOI Formula Explained</h2>
            
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-6 rounded-lg border">
                <h4 className="font-semibold mb-4 text-center">Breaking Down Each Component</h4>
                <div className="text-center text-xl font-mono space-y-2">
                  <div className="text-blue-600 dark:text-blue-400">Total Income (Gross Income - Vacancy)</div>
                  <div className="text-2xl">−</div>
                  <div className="text-orange-600 dark:text-orange-400">Operating Expenses</div>
                  <div className="text-2xl">=</div>
                  <div className="text-green-600 dark:text-green-400 font-bold">Net Operating Income (NOI)</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Income Components */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Income Components</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-sm">
                        Gross Rental Income
                      </Badge>
                      <h4 className="font-semibold">Total rent if 100% occupied</h4>
                      <p className="text-sm text-muted-foreground">
                        This is the total rent you&apos;d collect if every unit was occupied and paying full rent.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded text-sm">
                        <strong>Example:</strong> 10 units × $1,000/month × 12 months = $120,000
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="space-y-4">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-sm">
                        Other Income
                      </Badge>
                      <h4 className="font-semibold">Additional revenue streams</h4>
                      <p className="text-sm text-muted-foreground">
                        Extra money the property generates beyond base rent.
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Parking fees ($25/month per spot)</li>
                        <li>• Laundry machines (coin-operated)</li>
                        <li>• Storage units</li>
                        <li>• Late fees and pet deposits</li>
                      </ul>
                    </div>
                  </Card>
                </div>
                
                <Card className="p-6">
                  <div className="space-y-4">
                    <Badge className="bg-red-100 text-red-700 border-red-300 text-sm">
                      Vacancy Loss
                    </Badge>
                    <h4 className="font-semibold">Income lost from unoccupied units</h4>
                    <p className="text-sm text-muted-foreground">
                      Always budget for vacancy, even if currently 100% occupied. Properties need time between 
                      tenants for turnover, cleaning, and finding new renters.
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Physical Vacancy:</strong> Empty units with no tenant
                        </div>
                        <div>
                          <strong>Economic Vacancy:</strong> Units not generating expected income (non-payment, below-market rent)
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <strong>Typical Range:</strong> 5-10% (varies by market and property type)
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Operating Expenses */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-orange-600 dark:text-orange-400">Operating Expenses</h3>
                <p className="text-muted-foreground">
                  These are the costs to operate and maintain the property day-to-day. They don&apos;t include 
                  financing costs or major renovations.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Property Taxes</h5>
                    <p className="text-sm text-muted-foreground">
                      Paid to local government based on assessed property value
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Insurance</h5>
                    <p className="text-sm text-muted-foreground">
                      Protects the building against fire, storms, liability claims
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Property Management</h5>
                    <p className="text-sm text-muted-foreground">
                      Company that handles day-to-day operations (typically 6-10% of income)
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Utilities</h5>
                    <p className="text-sm text-muted-foreground">
                      Only if owner pays (common areas, master-metered properties)
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Maintenance & Repairs</h5>
                    <p className="text-sm text-muted-foreground">
                      Keeping property functional: plumbing repairs, painting, cleaning
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-semibold mb-2">Professional Services</h5>
                    <p className="text-sm text-muted-foreground">
                      Accounting, legal fees, marketing costs
                    </p>
                  </Card>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What&apos;s NOT Included in Operating Expenses:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>❌ Mortgage payments (debt service)</li>
                      <li>❌ Major renovations (capital improvements like new roof)</li>
                      <li>❌ Income taxes</li>
                      <li>❌ Depreciation (accounting concept)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </MotionWrapper>
        </section>

        {/* Real-World Example */}
        <section id="example" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Real-World Example</h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <p className="text-lg leading-relaxed">
                  Let&apos;s take <strong>{property.name}</strong> as an example. This {property.units}-unit property was 
                  purchased for {formatCurrency(property.purchasePrice)} and has {property.units} units renting for {formatCurrency(property.rentPerUnit)} per month each, with additional 
                  income from parking and laundry services. We&apos;ll assume a market vacancy rate of {formatPercentage(property.vacancyRate)} and an 
                  annual income growth rate of 3% to demonstrate NOI calculations over a 3-year period.
                </p>
                
                <div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">🏢 {property.name} - 3-Year Analysis</h4>
                  
                  <div className="overflow-x-auto">
                    <Table className="min-w-full bg-background">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48 bg-muted text-muted-foreground font-semibold">Line Item</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 1</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 2</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 3</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Income Section */}
                        <TableRow>
                          <TableCell className="font-medium">Gross Rental Income</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono">
                              {formatCurrency(year.grossRentalIncome)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Vacancy Loss ({formatPercentage(property.vacancyRate)})</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono">
                              {formatCurrency(-year.vacancyLoss, true)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Other Income (parking/laundry)</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono">
                              {formatCurrency(year.otherIncome)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-semibold">Effective Gross Income</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono font-semibold">
                              {formatCurrency(year.effectiveGrossIncome)}
                            </TableCell>
                          ))}
                        </TableRow>
                        
                        {/* Operating Expenses */}
                        <TableRow>
                          <TableCell className="font-medium">Property Taxes</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = property.expenses.propertyTaxes * Math.pow(1.03, year.year - 1)
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Insurance</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = property.expenses.insurance * Math.pow(1.03, year.year - 1)
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Property Management ({formatPercentage(property.expenses.propertyManagementRate)})</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = year.effectiveGrossIncome * property.expenses.propertyManagementRate
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Utilities</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = property.expenses.utilities * Math.pow(1.03, year.year - 1)
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Maintenance & Repairs</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = property.expenses.maintenanceRepairs * Math.pow(1.03, year.year - 1)
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Other Expenses</TableCell>
                          {projections.map((year, index) => {
                            const yearlyExpense = property.expenses.otherExpenses * Math.pow(1.03, year.year - 1)
                            return (
                              <TableCell key={index} className="text-center font-mono">
                                {formatCurrency(-yearlyExpense, true)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-semibold">Total Operating Expenses</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono font-semibold">
                              {formatCurrency(-year.totalOperatingExpenses, true)}
                            </TableCell>
                          ))}
                        </TableRow>
                        
                        {/* Final NOI */}
                        <TableRow className="border-t border-border mt-2 pt-3">
                          <TableCell className="font-bold text-primary">Net Operating Income (NOI)</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono font-bold text-primary text-lg">
                              {formatCurrency(year.noi)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Assumptions:</strong> 3% annual income growth, 3% annual expense growth, 
                      5% vacancy rate throughout. Property management calculated as 6% of effective gross income.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>


        {/* Calculator Section */}
        <section id="calculator" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Interactive NOI Calculator</h2>
            <p className="text-muted-foreground mb-6">
              Now that you&apos;ve seen how NOI is calculated in a real scenario, try inputting 
              your own numbers in the interactive calculator below. Start with the example 
              values or modify them to explore different scenarios.
            </p>
            
            <NOICalculator embedded={false} />
          </MotionWrapper>
        </section>

        {/* NOI vs Cash Flow */}
        <section id="vs-cashflow" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">NOI vs Cash Flow</h2>
            
            <Card className="p-6 mb-6">
              <CardContent className="space-y-4 p-0">
                <p className="text-lg leading-relaxed">
                  While <strong>NOI measures property performance</strong>, <strong>Cash Flow measures investment performance</strong>. 
                  Cash flow represents the actual money you receive as an investor after accounting for 
                  debt service and capital expenditures - it&apos;s what goes into your pocket.
                </p>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Think of cash flow as your &ldquo;real return&rdquo;</strong> - it shows 
                    how much money you actually receive after all expenses including financing costs and major improvements.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Cash Flow Formula:</h4>
                  <div className="text-center text-2xl font-mono">
                    Cash Flow = NOI - Capital Expenditures - Debt Service
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-base">
                    Net Operating Income (NOI)
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-3">Property Performance</h4>
                    <div className="text-2xl font-mono mb-3">Income - Operating Expenses</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Independent of financing</li>
                      <li>• Compares property-to-property</li>
                      <li>• Used for cap rates</li>
                      <li>• Before debt service</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-base">
                    Cash Flow
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-3">Investment Performance</h4>
                    <div className="text-xl font-mono mb-3">NOI - CapEx - Debt Service</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Depends on financing</li>
                      <li>• Investor-specific</li>
                      <li>• After all major expenses</li>
                      <li>• Shows actual returns</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <Alert className="mt-6">
              <AlertDescription>
                <strong>Key Insight:</strong> NOI shows how well the property performs, 
                while cash flow shows how well your investment performs. Both are important 
                but serve different purposes in analysis.
              </AlertDescription>
            </Alert>
          </MotionWrapper>
        </section>

        {/* Real-World Example Continued */}
        <section id="example-continued" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Real-World Example Continued: Cash Flow Analysis</h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <p className="text-lg leading-relaxed">
                  Now let&apos;s continue with our <strong>{property.name}</strong> and calculate the actual 
                  cash flow an investor would receive. We&apos;ll add financing assumptions and account for a major 
                  capital expenditure to show the complete investment picture.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Investment & Financing Assumptions:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <ul className="space-y-1">
                        <li><strong>Property Value:</strong> {formatCurrency(property.purchasePrice)}</li>
                        <li><strong>Loan-to-Value (LTV):</strong> 50%</li>
                        <li><strong>Loan Amount:</strong> {formatCurrency(property.purchasePrice * 0.5)}</li>
                        <li><strong>Interest Rate:</strong> 6.0%</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li><strong>Loan Term:</strong> 10 years</li>
                        <li><strong>Amortization:</strong> 30 years</li>
                        <li><strong>Annual Debt Service:</strong> $115,086</li>
                        <li><strong>Roof Replacement (Year 1):</strong> $100,000</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">🏢 {property.name} - Cash Flow Analysis</h4>
                  
                  <div className="overflow-x-auto">
                    <Table className="min-w-full bg-background">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48 bg-muted text-muted-foreground font-semibold">Line Item</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 1</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 2</TableHead>
                          <TableHead className="text-center min-w-32 bg-muted text-muted-foreground font-semibold">Year 3</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Starting with NOI */}
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-semibold">Net Operating Income (NOI)</TableCell>
                          {projections.map((year, index) => (
                            <TableCell key={index} className="text-center font-mono font-semibold">
                              {formatCurrency(year.noi)}
                            </TableCell>
                          ))}
                        </TableRow>
                        
                        {/* Capital Expenditures */}
                        <TableRow>
                          <TableCell className="font-medium">Capital Expenditures (Roof)</TableCell>
                          <TableCell className="text-center font-mono">($100,000)</TableCell>
                          <TableCell className="text-center font-mono">$0</TableCell>
                          <TableCell className="text-center font-mono">$0</TableCell>
                        </TableRow>
                        
                        {/* After CapEx */}
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-semibold">NOI After Capital Expenditures</TableCell>
                          {projections.map((year, index) => {
                            const capex = year.year === 1 ? 100000 : 0 // Roof replacement in year 1
                            return (
                              <TableCell key={index} className="text-center font-mono font-semibold">
                                {formatCurrency(year.noi - capex)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        
                        {/* Debt Service */}
                        <TableRow>
                          <TableCell className="font-medium">Annual Debt Service</TableCell>
                          <TableCell className="text-center font-mono">($115,086)</TableCell>
                          <TableCell className="text-center font-mono">($115,086)</TableCell>
                          <TableCell className="text-center font-mono">($115,086)</TableCell>
                        </TableRow>
                        
                        {/* Final Cash Flow */}
                        <TableRow className="border-t border-border mt-2 pt-3">
                          <TableCell className="font-bold text-primary">Cash Flow Before Taxes</TableCell>
                          {projections.map((year, index) => {
                            const capex = year.year === 1 ? 100000 : 0 // Roof replacement in year 1
                            const debtService = 115086 // Annual debt service
                            const cashFlow = year.noi - capex - debtService
                            return (
                              <TableCell key={index} className="text-center font-mono font-bold text-primary text-lg">
                                {formatCurrency(cashFlow)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Key Insights:</strong> Notice how Year 1 cash flow is significantly lower due to the $100,000 roof replacement. 
                      This shows why separating NOI from cash flow is important - the property&apos;s operating performance (NOI) 
                      remains strong, but the investor&apos;s return is impacted by necessary capital improvements and debt service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Key Takeaways</h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Key Differences:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>NOI</strong> = Property performance (before financing)</li>
                      <li>• <strong>Cash Flow</strong> = Investor returns (after debt & capex)</li>
                      <li>• NOI stays consistent regardless of financing</li>
                      <li>• Cash flow varies with debt structure and capital needs</li>
                      <li>• Use NOI for property comparisons and cap rates</li>
                      <li>• Use cash flow for investment return analysis</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Common Mistakes:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Confusing NOI with cash flow in analysis</li>
                      <li>• Including debt service in operating expenses</li>
                      <li>• Forgetting vacancy allowances in NOI</li>
                      <li>• Mixing capital improvements with repairs</li>
                      <li>• Using pro forma instead of actual expenses</li>
                      <li>• Comparing properties using cash flow instead of NOI</li>
                    </ul>
                  </div>
                </div>
                
                <Alert className="mt-6">
                  <AlertDescription>
                    <strong>Next Steps:</strong> Practice calculating both NOI and cash flow with real examples. 
                    Remember: NOI measures property performance, cash flow measures your investment returns. 
                    Master both concepts for complete real estate analysis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Knowledge Check Quiz - Only show if lesson is not completed */}
        {!isLessonCompleted && (
          <section id="quiz" className="mb-20 pb-20">
            <MotionWrapper
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              viewport={{ once: true }}
            >
              <p className="text-center text-muted-foreground mb-8">
                Test your understanding with these 3 questions. You must get all answers correct to complete the lesson.
              </p>
              
              <LessonQuiz
                lessonTitle="NOI Fundamentals"
                questions={[
                  {
                    id: 1,
                    question: "What is included in NOI calculation?",
                    options: [
                      "Mortgage payments",
                      "Property taxes and insurance",
                      "Income taxes",
                      "Major renovations"
                    ],
                    correctAnswer: 1,
                    hint: "Remember, NOI only includes operating expenses, not financing or capital costs. Think about day-to-day property expenses.",
                    explanation: "Property taxes and insurance are operating expenses that are necessary to run the property day-to-day. Mortgage payments are financing costs, income taxes are personal to the owner, and major renovations are capital improvements - none of these are included in NOI."
                  },
                  {
                    id: 2,
                    question: "A property has $200,000 gross income, 5% vacancy, and $60,000 operating expenses. What's the NOI?",
                    options: [
                      "$190,000",
                      "$140,000", 
                      "$130,000",
                      "$150,000"
                    ],
                    correctAnswer: 2,
                    hint: "Calculate step by step: Start with gross income, subtract vacancy loss (5% of $200,000), then subtract operating expenses.",
                    explanation: "Calculation: $200,000 gross income - $10,000 vacancy (5% of $200,000) - $60,000 operating expenses = $130,000 NOI. Always subtract vacancy from gross income first to get effective gross income, then subtract operating expenses."
                  },
                  {
                    id: 3,
                    question: "Why is NOI important for comparing properties?",
                    options: [
                      "It shows tax benefits",
                      "It includes appreciation potential", 
                      "It includes financing costs",
                      "It's independent of how the property is financed"
                    ],
                    correctAnswer: 3,
                    hint: "Think about what makes properties comparable. NOI shows property performance regardless of whether you paid cash or used a loan.",
                    explanation: "NOI excludes financing costs, so it shows the true operating performance of the property itself. This allows you to compare properties on an apples-to-apples basis, regardless of how different investors might finance their purchases."
                  }
                ]}
                onComplete={(passed: boolean) => {
                  if (passed) {
                    setQuizCompleted(true)
                    console.log('NOI Fundamentals quiz completed successfully!')
                  }
                }}
              />
            </MotionWrapper>
          </section>
        )}
      </LessonLayout>
    )
  }

  if (slug === 'cap-rate-basics') {
    // Get example property data and projections  
    const property = tunasTowerApartments
    const projections = generateYearlyProjections(property, 3)
    
    return (
      <LessonLayout
        metadata={lesson.metadata}
        sections={sectionsToShow}
        nextLesson={undefined}
        prevLesson={{ slug: "noi-fundamentals", title: "NOI and Cash Flow Basics" }}
        quizCompleted={quizCompleted || isLessonCompleted}
        backHref="/education/commercial-real-estate-basics"
        backText="Back to Commercial Real Estate Basics"
      >
        {/* Concept Section */}
        <section id="concept" className="space-y-6 mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              What is Cap Rate?
            </h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <p className="text-lg leading-relaxed">
                  In the last lesson, you learned how to calculate <strong>Net Operating Income (NOI)</strong>. 
                  Now let&apos;s discover what that NOI means for property value using the <strong>Capitalization Rate (Cap Rate)</strong>, 
                  also known as the <strong>unlevered return</strong>.
                </p>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Simple Analogy:</strong> Think of cap rate like the interest rate on a savings account. 
                    If you put $100,000 in a bank paying 5% interest, you earn $5,000 per year. 
                    Cap rate works the same way - it tells you the return you get if you bought the property with cash.
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">The Basic Formula:</h4>
                  <div className="text-center text-2xl font-mono bg-white dark:bg-gray-800 p-4 rounded border">
                    Cap Rate = NOI ÷ Property Price
                  </div>
                  <p className="text-sm text-center mt-3 text-muted-foreground">
                    This gives you the annual return percentage if you paid cash
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Real Estate Example:</h5>
                  <p className="text-sm">
                    Property Price: $1,000,000 • Annual NOI: $80,000 • Cap Rate: 8.0%
                    <br />
                    <span className="text-muted-foreground">Just like earning $80,000 per year on a $1,000,000 investment</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Why Cap Rates Matter Section */}
        <section id="why-matters" className="space-y-6 mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Why Cap Rates Matter</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    1
                  </div>
                  <h4 className="font-semibold text-lg">Comparing Properties</h4>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;Should I buy Property A with a 6% cap rate or Property B with an 8% cap rate?&rdquo;
                    Cap rates let you compare different properties on equal footing.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    2
                  </div>
                  <h4 className="font-semibold text-lg">Understanding Risk</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher cap rates usually mean higher risk. A 10% cap rate might offer more money 
                    but with more risk, while a 5% cap rate may offer a more stable return.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    3
                  </div>
                  <h4 className="font-semibold text-lg">Calculating Value</h4>
                  <p className="text-sm text-muted-foreground">
                    If you know the NOI and cap rate, you can find property value. 
                    This helps you determine if a property is priced fairly.
                  </p>
                </div>
              </Card>
            </div>
          </MotionWrapper>
        </section>

        {/* Formula Section */}
        <section id="formula" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">The Simple Formula</h2>
            
            <Card className="p-6 mb-6">
              <CardContent className="p-0 space-y-6">
                <p className="text-lg">
                  The cap rate formula is actually three formulas in one. You can rearrange it to find 
                  different pieces of information depending on what you know:
                </p>
                
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <div className="text-center space-y-3">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">Finding the Return</div>
                      <div className="text-xl font-mono">
                        Cap Rate = <br />
                        NOI ÷ Price
                      </div>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;What return will I get?&rdquo;
                      </p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <div className="text-center space-y-3">
                      <div className="text-green-600 dark:text-green-400 font-semibold">Finding the Price</div>
                      <div className="text-xl font-mono">
                        Price = <br />
                        NOI ÷ Cap Rate
                      </div>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;What should I pay?&rdquo;
                      </p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                    <div className="text-center space-y-3">
                      <div className="text-purple-600 dark:text-purple-400 font-semibold">Finding the NOI</div>
                      <div className="text-xl font-mono">
                        NOI = <br />
                        Cap Rate × Price
                      </div>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;How much income do I need?&rdquo;
                      </p>
                    </div>
                  </Card>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Remember from the NOI lesson:</strong> NOI = Income - Operating Expenses (but NOT debt service, taxes, or major improvements)
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Why &ldquo;Unlevered&rdquo; Return?</h5>
                  <p className="text-sm text-muted-foreground">
                    Cap rate is called the <strong>&ldquo;unlevered return&rdquo;</strong> because it excludes the effects of financing (leverage). 
                    It shows the return based purely on the property&apos;s performance, as if you paid 100% cash. 
                    This makes it perfect for comparing different properties regardless of how they&apos;re financed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Example Section */}
        <section id="example" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Continued Example</h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <p className="text-lg leading-relaxed">
                  Let&apos;s continue with our <strong>{property.name}</strong> from the NOI lesson. 
                  We calculated the NOI, now let&apos;s see what cap rate this property offers and what that means.
                </p>
                
                <div className="bg-muted/30 dark:bg-muted/60 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">🏢 {property.name} - Cap Rate Analysis</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">Property Details:</h5>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Purchase Price:</strong> {formatCurrency(property.purchasePrice)}</li>
                        <li><strong>{property.units} units at {formatCurrency(property.rentPerUnit)}/month each</strong></li>
                        <li><strong>{formatPercentage(property.vacancyRate)} vacancy rate</strong></li>
                        <li><strong>Year 1 NOI:</strong> {formatCurrency(property.noi)} <span className="text-muted-foreground">(from NOI lesson)</span></li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="font-medium">Cap Rate Calculation:</h5>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                        <div className="space-y-2 font-mono text-sm">
                          <div>Cap Rate = NOI ÷ Property Price</div>
                          <div>Cap Rate = {formatCurrency(property.noi)} ÷ {formatCurrency(property.purchasePrice)}</div>
                          <div className="pt-2 border-t text-lg font-bold text-primary">
                            Cap Rate = {formatPercentage(property.capRate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mt-6">
                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">What Does {formatPercentage(property.capRate)} Mean?</h5>
                    <ul className="text-sm space-y-1">
                      <li>• If you paid {formatCurrency(property.purchasePrice)} cash, you&apos;d earn {formatPercentage(property.capRate)} annually from NOI</li>
                      <li>• That&apos;s like earning {formatCurrency(property.noi)} per year on your {formatCurrency(property.purchasePrice)} investment</li>
                    </ul>
                  </div>

                  <div className="bg-muted/20 p-6 rounded-lg mt-6">
                    <h5 className="font-semibold mb-4 text-center">How Investors Make Money: NOI Growth = Value Growth</h5>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cap rates are market metrics determined by what similar properties sell for in your area. 
                      As rents increase over time or expenses decrease, NOI grows. If the market cap rate stays the same ({formatPercentage(property.capRate)}), 
                      the property value increases. This is how investors build wealth - by increasing income and controlling expenses, 
                      not by arbitrarily deciding what cap rate their property deserves.
                    </p>
                    
                    <div className="space-y-4">
                      {projections.map((year, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded">
                          <div className="font-medium">Year {year.year}:</div>
                          <div className="text-sm font-mono">
                            {formatCurrency(year.noi)} NOI ÷ {formatPercentage(property.capRate)} = {formatCurrency(year.propertyValue)} value
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Value Growth: {formatCurrency(projections[2].propertyValue - projections[0].propertyValue)} over 3 years
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        This wealth building happens even if you never sell the property!
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="mt-6">
                    <AlertDescription>
                      <strong>Key Insight:</strong> Cap rate is the connection between income and value. When you increase NOI 
                      but keep the same market cap rate, property value grows. Smart investors try to sell 
                      at the same or lower cap rate to maximize their returns.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Interactive Calculator</h2>
            <p className="text-muted-foreground mb-6">
              Try the calculator with different NOI and property price combinations. Start with our 
              {property.name} example ({formatCurrency(property.noi)} NOI, {formatCurrency(property.purchasePrice)} price) and see how changes affect the cap rate.
            </p>
            
            <CapRateCalculator embedded={false} />
          </MotionWrapper>
        </section>

        {/* Market Reading Section */}
        <section id="market-reading" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Reading the Market</h2>
            
            <Card className="p-6 mb-6">
              <CardContent className="p-0 space-y-6">
                <p className="text-lg">
                  Cap rates vary by property type, location, and market conditions.
                </p>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> You cannot arbitrarily decide your property has a 1% cap rate. 
                    Cap rates are determined by what similar properties actually sell for in your market. 
                    You must research comparable sales to understand what cap rate buyers are willing to accept.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Understanding Pro Forma vs. Actual Numbers</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sellers sometimes advertise cap rates based on projected income rather than actual income. 
                    A property listed as &ldquo;6% cap rate&rdquo; might actually be 3% based on current, actual rents.
                  </p>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div><strong>Pro forma:</strong> Uses projected or market rents (what rents could be)</div>
                    <div><strong>Actual:</strong> Uses current rent rolls (what rents actually are)</div>
                    <div><strong>Best practice:</strong> Always verify actual rent rolls and operating statements</div>
                  </div>
                </div>


                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">{property.name} Analysis:</h5>
                  <p className="text-sm">
                    At {formatPercentage(property.capRate)}, {property.name} falls in the &ldquo;value-add or secondary market&rdquo; range. 
                    This suggests it might be in a smaller city or need some improvements, but offers good income potential. 
                    Remember: this {formatPercentage(property.capRate)} cap rate comes from researching what similar {property.units}-unit apartment buildings 
                    actually sold for in the same market, not from wishful thinking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="mb-12">
          <MotionWrapper
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Key Takeaways</h2>
            
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">What You&apos;ve Learned:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Cap Rate = NOI ÷ Property Price</strong> - This tells you the unlevered return (as if you paid cash)</li>
                    <li>• <strong>Cap rates are &ldquo;unlevered&rdquo; returns</strong> - They exclude financing effects, showing pure property performance</li>
                    <li>• <strong>Higher cap rates usually mean higher risk</strong> - A 10% property isn&apos;t always better than a 5% property</li>
                    <li>• <strong>Cap rates help you compare properties</strong> - They put different properties on equal footing regardless of financing</li>
                    <li>• <strong>Cap rates differ across locations and property types</strong> - Different markets and property types (office, retail, multifamily) trade at different cap rate ranges based on their risk profiles</li>
                    <li>• <strong>You can rearrange the formula</strong> - Find cap rate, property value, or NOI depending on what you know</li>
                  </ul>
                </div>
                
                <Alert className="mt-6">
                  <AlertDescription>
                    <strong>What&apos;s Next:</strong> You&apos;ve mastered NOI and cap rates - the foundation of commercial real estate analysis! 
                    In future lessons, we&apos;ll explore different ways to value properties beyond just cap rates, 
                    including financing impacts and advanced analysis techniques.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </MotionWrapper>
        </section>

        {/* Knowledge Check Quiz - Only show if lesson is not completed */}
        {!isLessonCompleted && (
          <section id="quiz" className="mb-20 pb-20">
            <MotionWrapper
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-center text-muted-foreground mb-8">
                Test your understanding with these 3 questions. You must get all answers correct to complete the lesson.
              </p>
              
              <LessonQuiz
                lessonTitle="Cap Rate Basics"
                questions={[
                  {
                    id: 1,
                    question: "What does the cap rate formula calculate?",
                    options: [
                      "The annual return if you paid cash for the property",
                      "The total return including appreciation",
                      "The monthly rent per square foot",
                      "The property's mortgage payment"
                    ],
                    correctAnswer: 0,
                    hint: "Think about what cap rate represents - it&apos;s the relationship between NOI and property value, showing the return you&apos;d get without financing.",
                    explanation: "Cap Rate = NOI ÷ Property Price gives you the annual return percentage if you bought the property with cash. It excludes financing costs and focuses purely on the property's operating performance."
                  },
                  {
                    id: 2,
                    question: "A property costs $2,000,000 and generates $160,000 NOI annually. What's the cap rate?",
                    options: [
                      "6.25%",
                      "12.5%",
                      "8.0%",
                      "5.0%"
                    ],
                    correctAnswer: 2,
                    hint: "Use the cap rate formula: NOI ÷ Property Price. Calculate $160,000 ÷ $2,000,000.",
                    explanation: "Cap Rate = $160,000 NOI ÷ $2,000,000 Price = 0.08 = 8.0%. This means if you bought the property with cash, you&apos;d earn an 8% annual return from the NOI."
                  },
                  {
                    id: 3,
                    question: "Why can&apos;t you just decide your property has a 2% cap rate?",
                    options: [
                      "Cap rates are set by the government",
                      "Only banks can determine cap rates",
                      "Cap rates never change over time",
                      "Cap rates are determined by what similar properties actually sell for in the market"
                    ],
                    correctAnswer: 3,
                    hint: "Remember what determines cap rates in the real world. They reflect what investors are actually willing to pay for properties with similar NOI.",
                    explanation: "Cap rates are market-driven metrics determined by what similar properties actually sell for in your area. You must research comparable sales to understand what cap rate buyers are willing to accept - you can&apos;t arbitrarily decide your property deserves a specific cap rate."
                  }
                ]}
                onComplete={(passed: boolean) => {
                  if (passed) {
                    setQuizCompleted(true)
                    console.log('Cap Rate Basics quiz completed successfully!')
                  }
                }}
              />
            </MotionWrapper>
          </section>
        )}
      </LessonLayout>
    )
  }

  return notFound()
}