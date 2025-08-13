'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Share2Icon, UserIcon, MailIcon, MoreVerticalIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Portfolio, PortfolioMember, PortfolioInvitation } from '@/lib/supabase'

interface SharePortfolioDialogProps {
  portfolio: Portfolio
  trigger?: React.ReactNode
  onShareSuccess?: () => void
}

const shareSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['editor', 'viewer'], { 
    message: 'Please select a role' 
  }),
})

type ShareFormData = z.infer<typeof shareSchema>

export function SharePortfolioDialog({ 
  portfolio, 
  trigger,
  onShareSuccess 
}: SharePortfolioDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<PortfolioMember[]>([])
  const [invitations, setInvitations] = useState<PortfolioInvitation[]>([])

  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  })

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true)
      const response = await fetch(`/api/portfolios/${portfolio.id}/members`)
      
      if (!response.ok) {
        throw new Error('Failed to load members')
      }

      const data = await response.json()
      setMembers(data.members || [])
      setInvitations(data.pending_invitations || [])
    } catch (error) {
      console.error('Error loading members:', error)
      setError('Failed to load portfolio members')
    } finally {
      setLoadingMembers(false)
    }
  }, [portfolio.id])

  // Load members when dialog opens
  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open, loadMembers])

  const onSubmit = async (data: ShareFormData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/portfolios/${portfolio.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to share portfolio')
      }

      // Reset form and reload members
      form.reset()
      await loadMembers()
      onShareSuccess?.()

    } catch (error) {
      console.error('Error sharing portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to share portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      await loadMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: 'editor' | 'viewer') => {
    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update member role')
      }

      await loadMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      setError(error instanceof Error ? error.message : 'Failed to update member role')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'editor': return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2Icon className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Portfolio</DialogTitle>
          <DialogDescription>
            Share &ldquo;{portfolio.name}&rdquo; with others by inviting them via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite People</CardTitle>
              <CardDescription>
                Send an invitation to collaborate on this portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter email address"
                              className="flex-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>Role</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending invitation...' : 'Send invitation'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Separator />

          {/* Current Members */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">People with access</h4>
              <p className="text-sm text-muted-foreground">
                Manage who can view and edit this portfolio
              </p>
            </div>

            {loadingMembers ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {member.user?.name || member.user?.email}
                        </p>
                        <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user?.email}
                      </p>
                    </div>
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateMemberRole(member.id, 'editor')}
                            disabled={member.role === 'editor'}
                          >
                            Make Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateMemberRole(member.id, 'viewer')}
                            disabled={member.role === 'viewer'}
                          >
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}

                {/* Pending Invitations */}
                {invitations.length > 0 && (
                  <div className="pt-2">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Pending invitations
                    </h5>
                    <div className="space-y-2">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <MailIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {invitation.email}
                              </p>
                              <Badge className={`text-xs ${getRoleColor(invitation.role)}`}>
                                {invitation.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Invited {formatDate(invitation.created_at)} • Expires {formatDate(invitation.expires_at)}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pending
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permission Explanation */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h5 className="text-sm font-medium mb-2">Permission levels</h5>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Editor</Badge>
                <span>Can view, add, edit, and delete properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-gray-100 text-gray-800 border-gray-200">Viewer</Badge>
                <span>Can only view properties (read-only access)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">Owner</Badge>
                <span>Full control including sharing and portfolio management</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}