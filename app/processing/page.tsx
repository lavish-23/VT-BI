'use client'

import {
  useEffect,
  useState,
  Suspense,
} from 'react'

import {
  useRouter,
  useSearchParams,
} from 'next/navigation'

import { motion } from 'motion/react'

import {
  CloudUpload,
  Search,
  Database,
  Cpu,
  Shield,
  Layers,
  FileCheck,
  CheckCircle2,
} from 'lucide-react'

import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: CloudUpload,
    label: 'Uploading file',
  },
  {
    icon: Search,
    label: 'Detecting file type',
  },
  {
    icon: Database,
    label: 'Extracting metadata',
  },
  {
    icon: Cpu,
    label: 'Running AI analysis',
  },
  {
    icon: Shield,
    label: 'Checking for manipulation',
  },
  {
    icon: Layers,
    label: 'Cross-modal verification',
  },
  {
    icon: FileCheck,
    label: 'Generating authenticity report',
  },
]

const stepDelays = [
  0,
  800,
  1700,
  2700,
  3900,
  5200,
  6500,
]

const totalDuration = 7800

function ProcessingContent() {
  const router = useRouter()
  const params = useSearchParams()

  const scanId = params.get('scanId')
  const fileName =
    params.get('file') ?? 'uploaded_file'

  const fileType =
    params.get('type') ?? 'document'

  const [currentStep, setCurrentStep] =
    useState(0)

  const [done, setDone] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!scanId) {
      setError('Scan ID is missing')
      return
    }

    const currentScanId = scanId

    const timers: ReturnType<typeof setTimeout>[] = []

    // -----------------------------------------
    // Animate processing steps
    // -----------------------------------------

    steps.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i)
        }, stepDelays[i]),
      )
    })

    // -----------------------------------------
    // Complete scan
    // -----------------------------------------

    timers.push(
      setTimeout(async () => {
        try {
          console.log(
            'Completing scan:',
            currentScanId,
          )

          const response = await fetch(
            `/api/scans/${encodeURIComponent(
              currentScanId,
            )}/complete`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type':
                  'application/json',
              },
            },
          )

          const data =
            await response.json()

          console.log(
            'Complete scan response:',
            data,
          )

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to complete scan',
            )
          }

          setDone(true)

          // -----------------------------------
          // Go to report using scanId
          // -----------------------------------

          router.push(
            `/report?scanId=${encodeURIComponent(
              currentScanId,
            )}`,
          )
        } catch (error) {
          console.error(
            'Scan completion failed:',
            error,
          )

          setError(
            error instanceof Error
              ? error.message
              : 'Failed to complete scan',
          )
        }
      }, totalDuration),
    )

    return () =>
      timers.forEach(clearTimeout)
  }, [scanId, router])

  // -----------------------------------------
  // Error screen
  // -----------------------------------------

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <Logo size="lg" />

        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">
            Analysis Failed
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>

        <button
          onClick={() => router.push('/scan')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">

      {/* Background */}

      <div className="grid-glow pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[300px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

      {/* Logo */}

      <motion.div
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="mb-12"
      >
        <Logo size="lg" />
      </motion.div>

      {/* Card */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
        }}
        className="glass w-full max-w-lg rounded-3xl border border-border/60 p-8 shadow-2xl shadow-primary/5"
      >

        {/* File info */}

        <div className="mb-8 rounded-xl bg-secondary/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Analyzing file
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {fileName}
          </p>

          <p className="text-xs text-muted-foreground capitalize">
            {fileType}
          </p>

          <p className="mt-1 text-[10px] text-muted-foreground">
            Scan ID: {scanId ?? 'Missing'}
          </p>
        </div>

        {/* Circular spinner */}

        <div className="mb-8 flex justify-center">
          <div className="relative">

            <svg
              width="80"
              height="80"
              className="-rotate-90"
            >
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="5"
              />

              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="oklch(0.6 0.24 260)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={
                  2 * Math.PI * 34
                }
                initial={{
                  strokeDashoffset:
                    2 * Math.PI * 34,
                }}
                animate={{
                  strokeDashoffset:
                    done
                      ? 0
                      : 2 *
                        Math.PI *
                        34 *
                        (1 -
                          (currentStep +
                            1) /
                            steps.length),
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                style={{
                  filter:
                    'drop-shadow(0 0 6px oklch(0.6 0.24 260))',
                }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {Math.round(
                  ((currentStep + 1) /
                    steps.length) *
                    100,
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}

        <div className="space-y-3">

          {steps.map((step, i) => {
            const completed =
              i < currentStep

            const active =
              i === currentStep

            const future =
              i > currentStep

            const Icon = step.icon

            return (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={{
                  opacity:
                    future ? 0.35 : 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                }}
                className="flex items-center gap-3"
              >

                <div
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg transition-colors',

                    completed
                      ? 'bg-success/15'
                      : active
                        ? 'bg-primary/15'
                        : 'bg-secondary/40',
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : active ? (
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Icon className="size-4 text-primary" />
                    </motion.div>
                  ) : (
                    <Icon className="size-4 text-muted-foreground" />
                  )}
                </div>

                <span
                  className={cn(
                    'text-sm font-medium',

                    completed
                      ? 'text-success'
                      : active
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>

                {active && (
                  <motion.div
                    className="ml-auto flex gap-0.5"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                  >
                    {[0, 1, 2].map(
                      (dot) => (
                        <motion.span
                          key={dot}
                          className="size-1.5 rounded-full bg-primary"
                          animate={{
                            opacity: [
                              0.3,
                              1,
                              0.3,
                            ],
                          }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay:
                              dot * 0.2,
                          }}
                        />
                      ),
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This typically takes 5–10 seconds · Do not close this tab
        </p>
      </motion.div>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Logo size="lg" />
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  )
}