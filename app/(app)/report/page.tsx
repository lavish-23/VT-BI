'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  CheckCircle2,
  FileText,
  Eye,
  ArrowLeft,
  Calendar,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScoreGauge } from '@/components/app/score-gauge'
import { MediaIcon } from '@/components/app/media-bits'
import { PageHeader } from '@/components/app/page-header'
import { PremiumModal } from '@/components/premium-modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mediaLabels } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Verdict = 'authentic' | 'suspicious' | 'deepfake'

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
  createdAt: string
}

const verdictMap: Record<Verdict, { text: string; color: string; badge: string }> = {
  authentic: {
    text: 'Likely Genuine',
    color: 'text-success',
    badge: 'bg-success/10 text-success border-success/30',
  },
  suspicious: {
    text: 'Suspicious Content',
    color: 'text-warning',
    badge: 'bg-warning/10 text-warning border-warning/30',
  },
  deepfake: {
    text: 'Likely Deepfake',
    color: 'text-destructive',
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
  },
}

const verdictOptions = [
  { value: 'all', label: 'All Verdicts', color: 'bg-muted-foreground' },
  { value: 'authentic', label: 'Authentic Only', color: 'bg-emerald-500' },
  { value: 'suspicious', label: 'Suspicious Only', color: 'bg-amber-500' },
  { value: 'deepfake', label: 'Deepfakes Only', color: 'bg-rose-500' },
]

function ReportContent() {
  const params = useSearchParams()
  const router = useRouter()
  const selectedId = params.get('scanId') || params.get('id')

  const [scans, setScans] = useState<any[]>([])
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Filters, Search & Custom Dropdown State
  const [searchQuery, setSearchQuery] = useState('')
  const [verdictFilter, setVerdictFilter] = useState<string>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        if (selectedId) {
          const response = await fetch(`/api/scans/${encodeURIComponent(selectedId)}`, {
            credentials: 'include',
            cache: 'no-store',
          })
          const data = await response.json()
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load report')
          }
          setSelectedScan(data.scan)
        } else {
          setSelectedScan(null)
          const response = await fetch('/api/scans/history', {
            credentials: 'include',
            cache: 'no-store',
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch detection reports')
          }
          setScans(data.scans || [])
        }
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Error fetching data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedId])

  const stats = useMemo(() => {
    return {
      total: scans.length,
      authentic: scans.filter((s) => s.verdict === 'authentic').length,
      suspicious: scans.filter((s) => s.verdict === 'suspicious').length,
      deepfake: scans.filter((s) => s.verdict === 'deepfake').length,
    }
  }, [scans])

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const matchName =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchVerdict = verdictFilter === 'all' || s.verdict === verdictFilter
      return matchName && matchVerdict
    })
  }, [scans, searchQuery, verdictFilter])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading detection reports...</p>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------------
  // VIEW 1: All Reports (Detection Reports Hub)
  // ----------------------------------------------------------------------
  if (!selectedId) {
    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="border-b border-border/50 pb-6">
          <PageHeader
            title="Detection Reports"
            description="Archive of all authenticity reports generated for your uploaded media."
          />
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total Reports</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-success/25 bg-success/5 p-4 shadow-sm">
            <p className="text-xs font-medium text-success">Likely Authentic</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-success">{stats.authentic}</p>
          </div>
          <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4 shadow-sm">
            <p className="text-xs font-medium text-warning">Suspicious</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-warning">{stats.suspicious}</p>
          </div>
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 shadow-sm">
            <p className="text-xs font-medium text-destructive">Deepfakes Flagged</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-destructive">{stats.deepfake}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-secondary/15 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by filename or SCN-ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Custom Pretty Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex h-9 items-center justify-between gap-2.5 rounded-xl border border-border/60 bg-background/70 px-3.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/50 hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      verdictOptions.find((o) => o.value === verdictFilter)?.color
                    )}
                  />
                  <span>
                    {verdictOptions.find((o) => o.value === verdictFilter)?.label}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'size-3.5 text-muted-foreground transition-transform duration-200',
                    isDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
                    {verdictOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setVerdictFilter(opt.value)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent/60',
                          verdictFilter === opt.value
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn('size-2 rounded-full', opt.color)} />
                          <span>{opt.label}</span>
                        </div>
                        {verdictFilter === opt.value && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 self-end rounded-xl border border-border/60 bg-background/60 p-1 sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                viewMode === 'table'
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Table View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {filteredScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-16 text-center">
            <FileText className="size-10 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold">No matching reports found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms or changing the verdict filter.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredScans.map((s) => {
              const verdictConf =
                verdictMap[s.verdict as Verdict] || {
                  text: 'Unknown',
                  color: 'text-muted-foreground',
                  badge: 'bg-secondary text-muted-foreground border-border',
                }

              return (
                <div
                  key={s.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card/70 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/80">
                        <MediaIcon type={s.type} className="size-4.5 text-muted-foreground" />
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                          verdictConf.badge
                        )}
                      >
                        {s.verdict}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="truncate font-semibold text-foreground" title={s.name}>
                        {s.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{s.id}</p>
                    </div>

                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Authenticity Score</span>
                        <span
                          className={cn(
                            'tabular-nums font-bold',
                            s.score >= 70
                              ? 'text-success'
                              : s.score >= 45
                              ? 'text-warning'
                              : 'text-destructive'
                          )}
                        >
                          {s.score}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/70">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            s.score >= 70
                              ? 'bg-success'
                              : s.score >= 45
                              ? 'bg-warning'
                              : 'bg-destructive'
                          )}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      {s.date}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-3 text-xs font-medium text-primary hover:text-primary"
                      onClick={() => router.push(`/report?id=${s.id}`)}
                    >
                      <Eye className="size-3.5" />
                      Inspect
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-secondary/20 hover:bg-transparent">
                  <TableHead className="py-3.5">File</TableHead>
                  <TableHead className="py-3.5">Type</TableHead>
                  <TableHead className="py-3.5">Score</TableHead>
                  <TableHead className="py-3.5">Verdict</TableHead>
                  <TableHead className="hidden py-3.5 sm:table-cell">Date</TableHead>
                  <TableHead className="py-3.5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {filteredScans.map((s) => (
                  <TableRow key={s.id} className="hover:bg-secondary/20">
                    <TableCell>
                      <p className="max-w-[220px] truncate font-medium text-foreground">{s.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{s.id}</p>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MediaIcon type={s.type} className="size-3.5" />
                        {mediaLabels[s.type as keyof typeof mediaLabels] || s.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          s.score >= 70
                            ? 'text-success'
                            : s.score >= 45
                            ? 'text-warning'
                            : 'text-destructive'
                        )}
                      >
                        {s.score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                          verdictMap[s.verdict as Verdict]?.badge || ''
                        )}
                      >
                        {s.verdict}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {s.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => router.push(`/report?id=${s.id}`)}
                      >
                        <Eye className="mr-1 size-3" />
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------------------------
  // VIEW 2: Single Detailed Inspection Report
  // ----------------------------------------------------------------------
  if (error || !selectedScan) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-destructive">Report unavailable</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error || 'Scan not found'}</p>
        <Button className="mt-4" onClick={() => router.push('/report')}>
          Back to Detection Reports
        </Button>
      </div>
    )
  }

  const verdictInfo = selectedScan.verdict
    ? verdictMap[selectedScan.verdict]
    : { text: 'Under Analysis', color: 'text-muted-foreground', badge: '' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/report')}>
          <ArrowLeft className="mr-1.5 size-4" />
          All Reports
        </Button>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="gradient-brand text-primary-foreground"
            onClick={() => {
              window.print()
              toast.success('Preparing PDF report...')
            }}
          >
            <Download className="mr-1.5 size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-8">
        <section className="glass rounded-3xl border border-border/60 p-8 text-center shadow-xl">
          <div className="flex justify-center">
            <ScoreGauge score={selectedScan.score ?? 0} size={200} />
          </div>

          <h2 className={cn('mt-4 text-2xl font-semibold', verdictInfo.color)}>
            {verdictInfo.text}
          </h2>

          <div className="mt-4 inline-flex items-center rounded-xl bg-secondary/40 px-4 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedScan.fileName}</span>
            <span className="mx-2">·</span>
            <span className="capitalize">{selectedScan.fileType}</span>
            <span className="mx-2">·</span>
            <span className="font-mono text-xs">{selectedScan.scanId}</span>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">AI Analysis Results</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(selectedScan.analysisCards || []).map((card) => (
              <div
                key={card.key}
                className={cn(
                  'glass flex items-start gap-3 rounded-2xl border p-4',
                  card.ok ? 'border-success/25 bg-success/5' : 'border-destructive/25 bg-destructive/5'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                    card.ok ? 'bg-success/15' : 'bg-destructive/15'
                  )}
                >
                  {card.ok ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <AlertTriangle className="size-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{card.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl border border-border/60 p-6 shadow-lg">
          <h2 className="mb-5 text-lg font-semibold">Threat Assessment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Possible Threat
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold">
                {selectedScan.verdict === 'authentic' ? (
                  <ShieldCheck className="size-4 text-success" />
                ) : (
                  <ShieldAlert className="size-4 text-warning" />
                )}
                {selectedScan.threat || 'None Detected'}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recommended Action
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">
                {selectedScan.action || 'Content Appears Safe'}
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gradient-brand flex-1 text-primary-foreground"
            onClick={() => {
              window.print()
              toast.success('Preparing PDF report...')
            }}
          >
            <Download className="mr-1.5 size-4" />
            Download Full PDF
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => setModalOpen(true)}
          >
            <ScanLine className="mr-1.5 size-4" />
            Verify Another File
          </Button>
        </div>
      </main>

      <PremiumModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  )
}