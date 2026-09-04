import React from 'react'
import {
  ImageIcon,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  File,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Verdict = 'authentic' | 'suspicious' | 'deepfake'

const icons: Record<string, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  pdf: FileText,
  'cross-modal': FileSpreadsheet,
}

export function MediaIcon({ type, className }: { type?: string; className?: string }) {
  const normalizedType = (type || '').toLowerCase().trim()
  const IconComponent = icons[normalizedType] || File

  return <IconComponent className={cn('size-4', className)} />
}

export function verdictColor(v: Verdict | string) {
  switch (v) {
    case 'authentic':
      return 'text-emerald-500'
    case 'suspicious':
      return 'text-amber-500'
    case 'deepfake':
      return 'text-rose-500'
    default:
      return 'text-muted-foreground'
  }
}

export function scoreColor(score: number) {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 45) return 'text-amber-500'
  return 'text-rose-500'
}

export function VerdictBadge({ verdict, className }: { verdict: Verdict | string; className?: string }) {
  const v = (verdict || '').toLowerCase()
  const styles =
    v === 'authentic'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
      : v === 'suspicious'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-500'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        styles,
        className
      )}
    >
      {verdict}
    </span>
  )
}