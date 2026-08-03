'use client'

import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatCardProps = {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  accent?: 'brand' | 'success' | 'warning' | 'danger'
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand:   'text-primary bg-primary/10',
  success: 'text-emerald-400 bg-emerald-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  danger:  'text-rose-400 bg-rose-500/10',
}

function useCountUp(value: string, duration = 1400) {
  const numericMatch = value.match(/[\d,.]+/)
  const suffix = numericMatch ? value.slice(numericMatch.index! + numericMatch[0].length) : ''
  const prefix = numericMatch ? value.slice(0, numericMatch.index) : ''
  const target = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0
  const isFloat = numericMatch?.[0].includes('.')

  const [display, setDisplay] = useState('0')
  const raf = useRef<number | null>(null)
  const startTs = useRef<number | null>(null)

  useEffect(() => {
    startTs.current = null
    const step = (ts: number) => {
      if (!startTs.current) startTs.current = ts
      const progress = Math.min((ts - startTs.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const cur = eased * target
      setDisplay(isFloat ? cur.toFixed(1) : Math.floor(cur).toLocaleString())
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value, duration, target, isFloat])

  return `${prefix}${display}${suffix}`
}

export function StatCard({ label, value, delta, deltaLabel, icon: Icon, accent = 'brand' }: StatCardProps) {
  const positive = (delta ?? 0) >= 0
  const animatedValue = useCountUp(value)

  return (
    <Card className="stat-card glass-panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-default">
      {/* Top glow line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-serif text-3xl font-semibold tracking-tight tabular-nums">{animatedValue}</p>
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6', accentMap[accent])}>
          <Icon className="size-5" />
        </div>
      </div>

      {typeof delta === 'number' && (
        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <span className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400',
          )}>
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">{deltaLabel ?? 'vs last month'}</span>
        </div>
      )}
    </Card>
  )
}
