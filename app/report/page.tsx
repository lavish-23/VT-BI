'use client'

import {
  useEffect,
  useState,
  Suspense,
} from 'react'

import {
  useSearchParams,
  useRouter,
} from 'next/navigation'

import Link from 'next/link'

import {
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

type Verdict =
  | 'authentic'
  | 'suspicious'
  | 'deepfake'

interface AnalysisCard {
  key: string
  label: string
  detail: string
  ok: boolean
}

interface Scan {
  scanId: string
  fileName: string
  fileType: string
  status: string
  score?: number
  verdict?: Verdict
  threat?: string
  action?: string
  analysisCards: AnalysisCard[]
}

const verdictMap: Record<
  Verdict,
  { text: string; color: string }
> = {
  authentic: {
    text: 'Likely Genuine',
    color: 'text-success',
  },

  suspicious: {
    text: 'Likely AI Generated',
    color: 'text-warning',
  },

  deepfake: {
    text: 'Likely Deepfake',
    color: 'text-destructive',
  },
}

const riskMap: Record<
  Verdict,
  {
    label: string
    className: string
  }
> = {
  authentic: {
    label: 'Low Risk',
    className:
      'bg-success/15 text-success border-success/30',
  },

  suspicious: {
    label: 'Medium Risk',
    className:
      'bg-warning/15 text-warning border-warning/30',
  },

  deepfake: {
    label: 'High Risk',
    className:
      'bg-destructive/15 text-destructive border-destructive/30',
  },
}

function ReportContent() {
  const params = useSearchParams()
  const router = useRouter()

  const scanId = params.get('scanId')

  const [scan, setScan] =
    useState<Scan | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [modalOpen, setModalOpen] =
    useState(false)

  // -----------------------------------------
  // Fetch scan from MongoDB
  // -----------------------------------------

useEffect(() => {
  if (!scanId) {
    setError('Scan ID is missing')
    setLoading(false)
    return
  }

  const currentScanId = scanId

  async function loadReport() {
    try {
      const response = await fetch(
        `/api/scans/${encodeURIComponent(currentScanId)}`,
        {
          credentials: 'include',
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to load report'
        )
      }

      setScan(data.scan)
    } catch (error) {
      console.error('Failed to load report:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load report'
      )
    } finally {
      setLoading(false)
    }
  }

  loadReport()
}, [scanId])

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Loading authenticity report...
        </p>
      </div>
    )
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------

  if (error || !scan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <h1 className="text-xl font-semibold text-destructive">
          Report unavailable
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {error || 'Scan not found'}
        </p>

        <Button
          className="mt-6"
          onClick={() =>
            router.push('/scan/upload')
          }
        >
          Start New Scan
        </Button>
      </div>
    )
  }

  // -----------------------------------------
  // Scan still processing
  // -----------------------------------------

  if (
    scan.status !== 'completed' ||
    !scan.verdict ||
    scan.score === undefined
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <h1 className="text-xl font-semibold">
          Analysis in progress
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Scan {scan.scanId} is still being analyzed.
        </p>

        <Button
          className="mt-6"
          onClick={() =>
            router.push(
              `/processing?scanId=${encodeURIComponent(
                scan.scanId
              )}`
            )
          }
        >
          Continue Analysis
        </Button>
      </div>
    )
  }

  const verdictInfo =
    verdictMap[scan.verdict]

  const risk =
    riskMap[scan.verdict]

  const handleDownload = () => {
    window.print()

    toast.success(
      'Preparing PDF report...'
    )
  }

  const handleVerifyAnother = () => {
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            size="sm"
            render={
              <Link href="/" />
            }
          >
            Back
          </Button>

          <span className="hidden text-sm font-medium text-muted-foreground sm:block">
            VeriTrust AI — Authenticity Report
          </span>

          <Button
            size="sm"
            className="gradient-brand text-primary-foreground"
            onClick={handleDownload}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 md:px-6">
        {/* Score */}

        <section className="glass rounded-3xl border border-border/60 p-8 text-center shadow-xl">
          <div className="flex justify-center">
            <ScoreGauge
              score={scan.score}
              size={200}
            />
          </div>

          <h1
            className={cn(
              'mt-4 text-2xl font-semibold',
              verdictInfo.color
            )}
          >
            {verdictInfo.text}
          </h1>

          <div className="mt-3 flex justify-center">
            <span
              className={cn(
                'inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold',
                risk.className
              )}
            >
              {risk.label}
            </span>
          </div>

          {/* File */}

          <div className="mt-5 rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              File analyzed:
            </span>{' '}

            <span className="font-mono text-xs">
              {scan.fileName}
            </span>

            <span className="mx-2">
              ·
            </span>

            <span className="capitalize">
              {scan.fileType}
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Scan ID: {scan.scanId}
          </p>
        </section>

        {/* Analysis */}

        <section>
          <h2 className="mb-4 text-lg font-semibold">
            AI Analysis Results
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scan.analysisCards.map(
              (card) => (
                <div
                  key={card.key}
                  className={cn(
                    'glass flex items-start gap-3 rounded-2xl border p-4',
                    card.ok
                      ? 'border-success/25 bg-success/5'
                      : 'border-destructive/25 bg-destructive/5'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                      card.ok
                        ? 'bg-success/15'
                        : 'bg-destructive/15'
                    )}
                  >
                    {card.ok ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <AlertTriangle className="size-4 text-destructive" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {card.label}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {card.detail}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Threat */}

        <section className="glass rounded-3xl border border-border/60 p-6 shadow-lg">
          <h2 className="mb-5 text-lg font-semibold">
            Threat Assessment
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Possible Threat
              </p>

              <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold">
                {scan.verdict ===
                'authentic' ? (
                  <ShieldCheck className="size-4 text-success" />
                ) : (
                  <ShieldAlert className="size-4 text-warning" />
                )}

                {scan.threat ||
                  'None Detected'}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recommended Action
              </p>

              <p className="mt-2">
                <span
                  className={cn(
                    'inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold',
                    risk.className
                  )}
                >
                  {scan.action ||
                    'Content Appears Safe'}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}

        <section className="flex flex-col gap-3 sm:flex-row">
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
            onClick={
              handleVerifyAnother
            }
          >
            <ScanLine className="size-4" />
            Verify Another File
          </Button>
        </section>
      </main>

      <PremiumModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">
            Loading report...
          </p>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  )
}