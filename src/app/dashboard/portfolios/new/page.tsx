'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreatePortfolio } from '@/hooks/use-portfolios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BuildingIcon, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

export default function NewPortfolioPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  
  const createPortfolioMutation = useCreatePortfolio()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await createPortfolioMutation.mutateAsync(formData)
      
      // Redirect to the new portfolio with success indication
      router.push(`/dashboard?portfolio_id=${result.portfolio.id}&created=true`)
    } catch (error) {
      console.error('Error creating portfolio:', error)
      // Error is handled by the mutation
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const isValid = formData.name.trim().length > 0
  const loading = createPortfolioMutation.isPending
  const error = createPortfolioMutation.error?.message || null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/portfolios">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Portfolios
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Portfolio</h1>
          <p className="text-muted-foreground">
            Create a new portfolio to organize your properties
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Portfolio Details
          </CardTitle>
          <CardDescription>
            Give your portfolio a name and optional description
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Portfolio Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Downtown Properties, Investment Portfolio"
                value={formData.name}
                onChange={handleChange('name')}
                maxLength={100}
                disabled={loading}
                autoFocus
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.name.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this portfolio..."
                value={formData.description}
                onChange={handleChange('description')}
                maxLength={500}
                disabled={loading}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Creating Portfolio...
                  </>
                ) : (
                  <>
                    <BuildingIcon className="h-4 w-4" />
                    Create Portfolio
                  </>
                )}
              </Button>

              <Link href="/dashboard/portfolios">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}