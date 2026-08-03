'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadBox } from '@/components/upload-box'

function detectType(file: File): string {
  const mime = file.type
  const name = file.name.toLowerCase()
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/.test(name)) return 'image'
  if (mime.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|flv)$/.test(name)) return 'video'
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a)$/.test(name)) return 'audio'
  return 'document'
}

const trustStats = [
  { value: '99.3%', label: 'Detection accuracy' },
  { value: '<2s', label: 'Average verdict time' },
  { value: '10M+', label: 'Files verified' },
  { value: 'SOC 2', label: 'Certified' },
]


export function Hero() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)

  const handleVerify = () => {
    if (!file) return
    router.push(`/processing?file=${encodeURIComponent(file.name)}&type=${encodeURIComponent(detectType(file))}`)
  }

  return (
    <section className="hero-section relative overflow-hidden pt-28 pb-20">

      {/* ── Premium background layers ── */}
      {/* Grid pattern */}
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      {/* Blue radial — top center */}
      <div className="pointer-events-none absolute -z-10 left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.19_264/30%),transparent_65%)] blur-[1px]" />
      {/* Purple glow — bottom left */}
      <div className="pointer-events-none absolute -z-10 -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.58_0.2_292/22%),transparent_65%)] blur-[2px]" />
      {/* Blue accent — bottom right */}
      <div className="pointer-events-none absolute -z-10 -right-24 bottom-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.19_264/18%),transparent_65%)] blur-[2px]" />
      {/* Subtle particles */}
      <div className="hero-particles pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center">

        {/* Badge */}
        <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          AI-Powered Digital Trust Verification
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-[64px]">
          Is this content{' '}
          <span className="relative inline-block">
            <span className="text-gradient">real or fake?</span>
            <span className="hero-underline" />
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Upload any image, video, audio or document and get an{' '}
          <span className="font-semibold text-foreground">AI authenticity verdict in seconds</span>
          {' '}— before you trust, share or act on it.
        </p>

        {/* Trust stats row */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {trustStats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Upload box */}
        <div className="mt-10 w-full">
          <UploadBox onFileSelect={setFile} className="min-h-[240px] w-full" />
        </div>

        {/* CTA */}
        <div className="mt-5 w-full">
          <Button
            size="lg"
            className="gradient-brand w-full py-6 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
            onClick={handleVerify}
            disabled={!file}
          >
            <ShieldCheck className="size-5" />
            Verify Authenticity Now
            <ArrowRight className="size-5" />
          </Button>
          {!file && (
            <p className="mt-2 text-xs text-muted-foreground">
              Drop or choose a file above — your first scan is free
            </p>
          )}
        </div>

        {/* Privacy Guarantee */}
        <div className="mt-4 w-full">
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left backdrop-blur-sm">
            <span className="mt-0.5 text-base leading-none">🔒</span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Privacy Guarantee —</span>{' '}
              Your files are encrypted, analyzed securely, and automatically deleted after processing.
            </p>
          </div>
        </div>

        {/* Perks */}
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { icon: CheckCircle2, text: '1 Free Verification' },
            { icon: Zap, text: 'Results in under 2s' },
            { icon: Lock, text: 'Files never stored' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon className="size-4 shrink-0 text-success" />
              {text}
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
