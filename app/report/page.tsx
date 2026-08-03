'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ScanLine,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScoreGauge } from '@/components/app/score-gauge'
import { PremiumModal } from '@/components/premium-modal'
import { cn } from '@/lib/utils'

// Demo data – score 34 = suspicious deepfake
const DEMO_SCORE = 34
const DEMO_VERDICT = 'suspicious' as const

const analysisCards = [
  { key: 'voice', label: 'Voice Clone Detected', icon: AlertTriangle, ok: false },
  { key: 'face', label: 'Face Swap Probability High', icon: AlertTriangle, ok: false },
  { key: 'meta', label: 'Metadata Modified', icon: AlertTriangle, ok: false },
  { key: 'artifacts', label: 'AI Generation Artifacts Detected', icon: AlertTriangle, ok: false },
]

const verdictMap = {
  authentic: { text: 'Likely Genuine', color: 'text-success' },
  suspicious: { text: 'Likely AI Generated', color: 'text-warning' },
  deepfake: { text: 'Likely Deepfake', color: 'text-destructive' },
}

const riskMap = {
  authentic: { label: 'Low Risk', className: 'bg-success/15 text-success border-success/30' },
  suspicious: { label: 'Medium Risk', className: 'bg-warning/15 text-warning border-warning/30' },
  deepfake: { label: 'High Risk', className: 'bg-destructive/15 text-destructive border-destructive/30' },
}

function ReportContent() {
  const params = useSearchParams()
  const router = useRouter()
  const fileName = params.get('file') ?? 'analyzed_file'

  const [modalOpen, setModalOpen] = useState(false)

  // Mark free verification as used
  useEffect(() => {
    localStorage.setItem('freeVerificationUsed', 'true')
  }, [])

  const handleVerifyAnother = () => {
    const used = localStorage.getItem('freeVerificationUsed')
    if (used) {
      setModalOpen(true)
    } else {
      router.push('/')
    }
  }

  const handleDownload = () => {
    window.print()
    toast.success('Preparing PDF report...')
  }

  const verdict = verdictMap[DEMO_VERDICT]
  const risk = riskMap[DEMO_VERDICT]

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className="grid-glow absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:px-6">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">
            VeriTrust AI — Authenticity Report
          </span>
          <Button size="sm" className="gradient-brand text-primary-foreground" onClick={handleDownload}>
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 md:px-6">
        {/* Hero gauge */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl border border-border/60 p-8 text-center shadow-xl shadow-primary/5"
        >
          <div className="flex justify-center">
            <ScoreGauge score={DEMO_SCORE} size={200} />
          </div>
          <h1 className={cn('mt-4 text-2xl font-semibold', verdict.color)}>{verdict.text}</h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span
              className={cn(
                'inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold',
                risk.className,
              )}
            >
              {risk.label}
            </span>
          </div>

          {/* File info */}
          <div className="mt-5 rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">File analyzed:</span>{' '}
            <span className="font-mono text-xs">{fileName}</span>
          </div>
        </motion.section>

        {/* AI Analysis cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="mb-4 text-lg font-semibold">AI Analysis Results</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {analysisCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.key}
                  className={cn(
                    'glass flex items-start gap-3 rounded-2xl border p-4',
                    card.ok
                      ? 'border-success/25 bg-success/5'
                      : 'border-destructive/25 bg-destructive/5',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                      card.ok ? 'bg-success/15' : 'bg-destructive/15',
                    )}
                  >
                    <Icon
                      className={cn('size-4', card.ok ? 'text-success' : 'text-destructive')}
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">{card.label}</p>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Threat Assessment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl border border-border/60 p-6 shadow-lg"
        >
          <h2 className="mb-5 text-lg font-semibold">Threat Assessment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Possible Threat
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldAlert className="size-4 text-warning" />
                Financial Scam
              </p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recommended Action
              </p>
              <p className="mt-2">
                <span className="inline-flex rounded-full border border-warning/30 bg-warning/15 px-3 py-0.5 text-xs font-semibold text-warning">
                  Verify Manually
                </span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="gradient-brand flex-1 text-primary-foreground"
            onClick={handleDownload}
          >
            <Download className="size-4" />
            Download PDF Report
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={handleVerifyAnother}
          >
            <ScanLine className="size-4" />
            Verify Another File
          </Button>
        </motion.section>
      </main>

      <PremiumModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
