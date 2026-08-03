import Link from 'next/link'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/logo'

const points = [
  'Cross-modal AI detection across image, video, audio & documents',
  'Unified authenticity score with full AI explainability',
  'SOC 2 aligned, encrypted and privacy-first by default',
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-card/40 lg:block">
        <div className="grid-glow pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/">
            <Logo />
          </Link>
          <div>
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-primary/30">
              <ShieldCheck className="size-7 text-primary-foreground" />
            </div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-balance">
              The Digital Trust Platform for the deepfake era.
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 VeriTrust AI, Inc. Trusted by banks, governments and enterprises.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] lg:hidden" />
        <div className="relative w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
