'use client'

import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
  size = 'md',
}: {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const box   = size === 'sm' ? 'size-7' : size === 'lg' ? 'size-10' : 'size-9'
  const icon  = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6'  : 'size-5'
  const text  = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <div className={cn('logo-root flex items-center gap-2.5 cursor-pointer', className)}>
      {/* Shield icon — pulses + glows on hover */}
      <div className={cn('logo-shield gradient-brand grid place-items-center rounded-xl shadow-lg shadow-primary/25 transition-all duration-300', box)}>
        <ShieldCheck className={cn('logo-icon text-primary-foreground transition-transform duration-300', icon)} strokeWidth={2.2} />
      </div>
      {showText && (
        <span className={cn('font-semibold tracking-tight text-foreground transition-opacity duration-300', text)}>
          VeriTrust<span className="text-gradient"> AI</span>
        </span>
      )}
    </div>
  )
}
