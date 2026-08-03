'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

function ringColor(score: number) {
  if (score >= 70) return 'oklch(0.7 0.16 155)'
  if (score >= 45) return 'oklch(0.78 0.15 75)'
  return 'oklch(0.62 0.22 20)'
}

function useCountUp(target: number, duration = 1400, delay = 300) {
  const [count, setCount] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const started = Date.now() + delay
    const step = () => {
      const now = Date.now()
      if (now < started) { raf.current = requestAnimationFrame(step); return }
      const progress = Math.min((now - started) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration, delay])

  return count
}

export function ScoreGauge({
  score,
  size = 220,
  strokeWidth = 16,
  label = 'Authenticity Score',
  className,
}: {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = ringColor(score)
  const displayScore = useCountUp(score, 1400, 300)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
        {/* Animated fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0 }}
          animate={{ strokeDashoffset: offset, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.3 } }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Counting number */}
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {displayScore}
          <span className="text-xl font-semibold">%</span>
        </span>
        <span className="mt-1 max-w-[70%] text-center text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
