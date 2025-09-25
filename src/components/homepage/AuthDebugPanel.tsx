'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, LogIn, UserPlus, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { AuthModal } from '@/components/modals/AuthModal'

export function AuthDebugPanel() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  // Only show in development when test data is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DATA === 'false') {
    return null
  }

  const handleShowSignIn = () => {
    setAuthModalMode('sign-in')
    setShowAuthModal(true)
  }

  const handleShowSignUp = () => {
    setAuthModalMode('sign-up')
    setShowAuthModal(true)
  }

  const handleShowSuccessState = () => {
    setShowSuccessModal(true)
  }

  return (
    <>
      <Card className="fixed bottom-4 right-4 w-80 z-50 bg-purple-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between text-purple-700">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Auth Debug Panel (Dev Only)
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-purple-700 hover:bg-purple-100"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs font-medium text-purple-700 mb-2">
                Test Authentication Modals:
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  Test auth flows without real authentication
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleShowSignIn}
                size="sm"
                variant="default"
                className="w-full"
              >
                <LogIn className="h-3 w-3 mr-2" />
                Show Sign In Modal
              </Button>

              <Button
                onClick={handleShowSignUp}
                size="sm"
                variant="default"
                className="w-full"
              >
                <UserPlus className="h-3 w-3 mr-2" />
                Show Sign Up Modal
              </Button>

              <Button
                onClick={handleShowSuccessState}
                size="sm"
                variant="secondary"
                className="w-full"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Show Success State
              </Button>
            </div>

            <div className="text-xs text-purple-600 space-y-1">
              <div>Test authentication modals and success states.</div>
              <div className="font-medium">🔐 Perfect for testing auth UX flows!</div>
              <div>Success state shows the &quot;Check your email&quot; confirmation.</div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Regular auth modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode={authModalMode}
      />

      {/* Mock success state modal - we'll create a custom one */}
      {showSuccessModal && (
        <MockSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
        />
      )}
    </>
  )
}

// Mock success modal component to simulate the post-signup state
interface MockSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MockSuccessModal({ open, onOpenChange }: MockSuccessModalProps) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-background border rounded-lg shadow-lg max-w-md sm:max-w-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold">Check your email</h2>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  We&apos;ve sent you a confirmation link at <strong>test@example.com</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to confirm your account and get started.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Back to Sign In
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}