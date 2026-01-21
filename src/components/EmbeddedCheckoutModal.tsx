import React, { useCallback, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { animate } from 'animejs'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { X, Crown, Lock } from '@phosphor-icons/react'
import { STRIPE_PUBLISHABLE_KEY } from '../config/stripe'
import { BillingInterval } from '../types/subscription'

// Initialize Stripe promise
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null

interface EmbeddedCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  billingInterval: BillingInterval
  onComplete?: () => void
}

export const EmbeddedCheckoutModal: React.FC<EmbeddedCheckoutModalProps> = ({
  isOpen,
  onClose,
  billingInterval,
  onComplete,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const createEmbeddedCheckout = useAction(api.stripe.createEmbeddedCheckoutSession)

  // Handle mount/unmount animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  // Animate in when visible
  useEffect(() => {
    if (isVisible && backdropRef.current && modalRef.current) {
      // Animate backdrop
      animate(backdropRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: 'outQuart',
      })

      // Animate modal
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'outQuart',
      })
    }
  }, [isVisible])

  // Handle close with animation
  const handleClose = useCallback(() => {
    if (backdropRef.current && modalRef.current) {
      // Animate out
      animate(backdropRef.current, {
        opacity: [1, 0],
        duration: 200,
        ease: 'inQuart',
      })

      animate(modalRef.current, {
        opacity: [1, 0],
        scale: [1, 0.95],
        translateY: [0, 20],
        duration: 200,
        ease: 'inQuart',
        onComplete: () => {
          setIsVisible(false)
          onClose()
        },
      })
    } else {
      setIsVisible(false)
      onClose()
    }
  }, [onClose])

  // Fetch client secret when modal opens
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null)
      setError(null)
      return
    }

    if (!stripePromise) {
      setError('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment.')
      return
    }

    setIsLoading(true)
    setError(null)

    createEmbeddedCheckout({
      billingInterval,
    })
      .then((result) => {
        if (result?.clientSecret) {
          setClientSecret(result.clientSecret)
        } else {
          setError('Failed to initialize checkout. Please try again.')
        }
      })
      .catch((err) => {
        console.error('Checkout error:', err)
        setError(err.message || 'Failed to initialize checkout. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isOpen, billingInterval, createEmbeddedCheckout])

  // Handle checkout completion
  const handleComplete = useCallback(() => {
    console.log('Checkout completed successfully')
    // Note: Stripe will redirect to return_url automatically
    // The modal will remain open until redirect happens
    // The usePaymentResult hook will show success toast after redirect
    onComplete?.()
  }, [onComplete])

  if (!isVisible) {
    return null
  }

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="w-full max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-hidden relative pointer-events-auto flex flex-col rounded-2xl border border-amber-500/10 bg-card shadow-2xl shadow-amber-500/10">
          {/* Premium Header */}
          <div className="relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />

            {/* Header content */}
            <div className="relative flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Premium Checkout</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3 text-green-400" />
                    <span>Secure payment</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Checkout Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading && (
              <div className="flex items-center justify-center min-h-[300px] sm:h-[400px] p-4 sm:p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400/30 border-t-amber-400" />
                    <Crown className="absolute inset-0 m-auto h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">Preparing your checkout...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center min-h-[300px] sm:h-[400px] p-4 sm:p-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                  <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                    <X className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-foreground font-medium">Unable to load checkout</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="mt-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {clientSecret && stripePromise && !isLoading && !error && (
              <div id="checkout">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    onComplete: handleComplete,
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
