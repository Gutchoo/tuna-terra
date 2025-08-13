'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portfolio')
      }

      const { portfolio } = await response.json()
      
      // Redirect to the new portfolio
      router.push(`/dashboard?portfolio_id=${portfolio.id}`)
    } catch (error) {
      console.error('Error creating portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to create portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const isValid = formData.name.trim().length > 0

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
                <BuildingIcon className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Portfolio'}
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