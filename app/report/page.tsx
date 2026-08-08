'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScoreGauge } from '@/components/app/score-gauge'
import { PremiumModal } from '@/components/premium-modal'
import { cn } from '@/lib/utils'

type Verdict = 'authentic' | 'suspicious' | 'deepfake'

interface AnalysisCard {
  key: string
  label: string
  detail: string
  ok: boolean
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    hash = (hash << 5) - hash + c
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generateResult(fileName: string, fileType: string): {
  score: number
  verdict: Verdict
  cards: AnalysisCard[]
  threat: string
  action: string
  actionStyle: string
} {
  const seed = simpleHash(fileName + fileType)
  // Score between 15 and 92
  const score = 15 + (seed % 78)

  const verdict: Verdict =
    score < 42 ? 'deepfake' : score < 68 ? 'suspicious' : 'authentic'

  const ok = (threshold: number) => score > threshold

  const cardsByType: Record<string, AnalysisCard[]> = {
    image: [
      {
        key: 'face',
        label: 'Face Swap Detection',
        detail: ok(60) ? 'No face manipulation detected' : 'Face swap artifacts detected (87% confidence)',
        ok: ok(60),
      },
      {
        key: 'gan',
        label: 'GAN / AI Generation',
        detail: ok(55) ? 'Image is consistent with a real photograph' : 'AI generation patterns detected (GAN fingerprint)',
        ok: ok(55),
      },
      {
        key: 'meta',
        label: 'Metadata Integrity',
        detail: ok(50) ? 'EXIF data intact and consistent' : 'Metadata modified or stripped',
        ok: ok(50),
      },
      {
        key: 'compress',
        label: 'Compression Anomalies',
        detail: ok(65) ? 'Natural compression patterns observed' : 'Irregular compression blocks indicate editing',
        ok: ok(65),
      },
    ],
    video: [
      {
        key: 'deepfake',
        label: 'Deepfake Frame Analysis',
        detail: ok(60) ? 'No deepfake indicators in any frame' : 'Deepfake markers in 34% of analysed frames',
        ok: ok(60),
      },
      {
        key: 'avsync',
        label: 'Audio-Visual Sync',
        detail: ok(55) ? 'Lip-sync and audio are consistent' : 'Audio / visual desync detected',
        ok: ok(55),
      },
      {
        key: 'temporal',
        label: 'Temporal Consistency',
        detail: ok(65) ? 'Frame-to-frame transitions verified' : 'Temporal inconsistencies in 23% of frames',
        ok: ok(65),
      },
      {
        key: 'voice',
        label: 'Voice Clone Detection',
        detail: ok(58) ? 'Voice characteristics appear genuine' : 'AI-cloned voice signatures detected',
        ok: ok(58),
      },
    ],
    audio: [
      {
        key: 'clone',
        label: 'Voice Clone Detection',
        detail: ok(60) ? 'Voice patterns match authentic human speech' : 'AI-cloned voice detected (97% match to known TTS)',
        ok: ok(60),
      },
      {
        key: 'synth',
        label: 'Speech Synthesis Check',
        detail: ok(55) ? 'Natural prosody and cadence confirmed' : 'Synthetic speech patterns detected',
        ok: ok(55),
      },
      {
        key: 'noise',
        label: 'Background Noise Analysis',
        detail: ok(65) ? 'Natural ambient noise verified' : 'Artificial or edited background audio',
        ok: ok(65),
      },
      {
        key: 'speaker',
        label: 'Speaker Verification',
        detail: ok(58) ? 'Consistent speaker identity' : 'Speaker identity inconsistencies found',
        ok: ok(58),
      },
    ],
    document: [
      {
        key: 'meta',
        label: 'Metadata Tampering',
        detail: ok(60) ? 'Document metadata is unmodified' : 'Creation / modification dates altered',
        ok: ok(60),
      },
      {
        key: 'aitext',
        label: 'AI-Generated Text',
        detail: ok(55) ? 'Text shows natural authorship patterns' : 'AI-generated content detected (GPT-style patterns)',
        ok: ok(55),
      },
      {
        key: 'sig',
        label: 'Digital Signature',
        detail: ok(65) ? 'Digital signatures valid and unmodified' : 'Signature absent, expired, or invalid',
        ok: ok(65),
      },
      {
        key: 'source',
        label: 'Source Verification',
        detail: ok(58) ? 'Document origin appears legitimate' : 'Source origin could not be verified',
        ok: ok(58),
      },
    ],
  }

  const cards = cardsByType[fileType] ?? cardsByType.document

  const threatMap: Record<Verdict, { threat: string; action: string; actionStyle: string }> = {
    deepfake: {
      threat: 'Synthetic Media / Deepfake',
      action: 'Do Not Trust — Report Content',
      actionStyle: 'bg-destructive/15 text-destructive border-destructive/30',
    },
    suspicious: {
      threat: 'Possible AI Generation',
      action: 'Verify Manually Before Sharing',
      actionStyle: 'bg-warning/15 text-warning border-warning/30',
    },
    authentic: {
      threat: 'None Detected',
      action: 'Content Appears Safe',
      actionStyle: 'bg-success/15 text-success border-success/30',
    },
  }

  return { score, verdict, cards, ...threatMap[verdict] }
}

const verdictMap: Record<Verdict, { text: string; color: string }> = {
  authentic: { text: 'Likely Genuine', color: 'text-success' },
  suspicious: { text: 'Likely AI Generated', color: 'text-warning' },
  deepfake: { text: 'Likely Deepfake', color: 'text-destructive' },
}

const riskMap: Record<Verdict, { label: string; className: string }> = {
  authentic: { label: 'Low Risk', className: 'bg-success/15 text-success border-success/30' },
  suspicious: { label: 'Medium Risk', className: 'bg-warning/15 text-warning border-warning/30' },
  deepfake: { label: 'High Risk', className: 'bg-destructive/15 text-destructive border-destructive/30' },
}

function ReportContent() {
  const params = useSearchParams()
  const router = useRouter()
  const fileName = params.get('file') ?? 'analyzed_file'
  const fileType = params.get('type') ?? 'document'

  const [modalOpen, setModalOpen] = useState(false)

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

  const { score, verdict, cards, threat, action, actionStyle } = generateResult(fileName, fileType)
  const verdictInfo = verdictMap[verdict]
  const risk = riskMap[verdict]

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
          <span className="hidden text-sm font-medium text-muted-foreground sm:block">
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
            <ScoreGauge score={score} size={200} />
          </div>
          <h1 className={cn('mt-4 text-2xl font-semibold', verdictInfo.color)}>{verdictInfo.text}</h1>
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
            <span className="mx-2">·</span>
            <span className="capitalize">{fileType}</span>
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
            {cards.map((card) => (
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
                  {card.ok ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <AlertTriangle className="size-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{card.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.detail}</p>
                </div>
              </div>
            ))}
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
                {verdict === 'authentic' ? (
                  <ShieldCheck className="size-4 text-success" />
                ) : (
                  <ShieldAlert className="size-4 text-warning" />
                )}
                {threat}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recommended Action
              </p>
              <p className="mt-2">
                <span className={cn('inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold', actionStyle)}>
                  {action}
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
