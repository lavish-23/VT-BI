import { ImageIcon, Video, AudioLines, FileText, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaType, Verdict } from '@/lib/mock-data'
import { verdictLabels } from '@/lib/mock-data'

const icons: Record<MediaType, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: AudioLines,
  document: FileText,
  'cross-modal': Layers,
}

export function MediaIcon({
  type,
  className,
}: {
  type: MediaType
  className?: string
}) {
  const Icon = icons[type]
  return <Icon className={cn('size-4', className)} />
}

export function verdictColor(v: Verdict) {
  if (v === 'authentic') return 'text-success'
  if (v === 'deepfake') return 'text-destructive'
  return 'text-warning'
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const styles: Record<Verdict, string> = {
    authentic: 'bg-success/12 text-success border-success/25',
    suspicious: 'bg-warning/12 text-warning border-warning/25',
    deepfake: 'bg-destructive/12 text-destructive border-destructive/25',
  }
  return (
    <span
      data-slot="verdict-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[verdict],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {verdictLabels[verdict]}
    </span>
  )
}

export function scoreColor(score: number) {
  if (score >= 70) return 'text-success'
  if (score >= 45) return 'text-warning'
  return 'text-destructive'
}
