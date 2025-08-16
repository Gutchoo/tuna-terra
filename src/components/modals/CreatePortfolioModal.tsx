'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BuildingIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCreatePortfolio } from '@/hooks/use-portfolios'

interface CreatePortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePortfolioModal({ 
  open, 
  onOpenChange
}: CreatePortfolioModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const createPortfolioMutation = useCreatePortfolio()

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: ''
      })
      setIsRedirecting(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await createPortfolioMutation.mutateAsync(formData)
      
      // Set redirecting state to show loading during redirect
      setIsRedirecting(true)

      // Invalidate portfolios cache for real-time updates
      await queryClient.invalidateQueries({ 
        queryKey: ['portfolios'] 
      })

      // Close modal
      onOpenChange(false)
      
      // Redirect to the new portfolio - toast will be shown after redirect
      router.push(`/dashboard?portfolio_id=${result.portfolio.id}&created=true`)
    } catch (error) {
      console.error('Error creating portfolio:', error)
      toast.error('Failed to create portfolio', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      // Reset redirecting state on error
      setIsRedirecting(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const isValid = formData.name.trim().length > 0
  const loading = createPortfolioMutation.isPending || isRedirecting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Create Portfolio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Create a new portfolio to organize your properties
            </p>
          </div>

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
                className="flex items-center gap-2 flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    {isRedirecting ? 'Redirecting...' : 'Creating Portfolio...'}
                  </>
                ) : (
                  <>
                    <BuildingIcon className="h-4 w-4" />
                    Create Portfolio
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}