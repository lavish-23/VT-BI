'use client'

import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { Crown, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const features = [
  'Unlimited Verifications',
  'Cross-Modal Detection',
  'Detailed AI Explanations',
  'Downloadable Reports',
  'Scan History',
  'Priority Processing',
  'API Access',
]

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-primary/10"
          >
            {/* Gradient glow top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-32 w-64 rounded-full bg-accent/15 blur-2xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="relative p-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="gradient-brand grid size-16 place-items-center rounded-2xl shadow-lg shadow-primary/30">
                  <Crown className="size-8 text-primary-foreground" />
                </div>
              </div>

              {/* Text */}
              <div className="mt-5 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Continue Verifying Unlimited Files
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  You've used your free verification. Create an account to unlock unlimited scans,
                  detailed AI explanations, and downloadable reports.
                </p>
              </div>

              {/* Feature list */}
              <ul className="mt-5 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  size="lg"
                  className="gradient-brand w-full text-primary-foreground"
                  render={<Link href="/signup" />}
                >
                  Sign Up — It's Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  render={<Link href="/login" />}
                >
                  Login
                </Button>
                <button
                  onClick={onClose}
                  className="mt-1 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
