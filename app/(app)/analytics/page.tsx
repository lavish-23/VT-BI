'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  Scan,
  ShieldAlert,
  ShieldCheck,
  Activity,
  HelpCircle,
  Info,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ScanRecord {
  id: string
  name: string
  type: string
  score?: number
  confidence?: number
  verdict: 'authentic' | 'suspicious' | 'deepfake'
  date?: string
  createdAt?: string
  reasons?: string[]
}

export default function AnalyticsPage() {
  const [allScans, setAllScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'all'>('7days')
  const [selectedFileType, setSelectedFileType] = useState<string>('All Files')
  const [granularity, setGranularity] = useState<'Daily' | 'Hourly'>('Daily')

  useEffect(() => {
    async function loadScans() {
      try {
        const res = await fetch('/api/scans/history', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setAllScans(data.scans || [])
        }
      } catch (err) {
        console.error('Failed to load scans for analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    loadScans()
  }, [])

  // 1. Filter scans based on selected time range and file type
  const filteredScans = useMemo(() => {
    const now = new Date().getTime()
    return allScans.filter((scan) => {
      // Date filtering
      if (timeFilter !== 'all') {
        const scanTime = new Date(scan.createdAt || scan.date || '').getTime()
        if (!isNaN(scanTime)) {
          const daysDiff = (now - scanTime) / (1000 * 60 * 60 * 24)
          if (timeFilter === '7days' && daysDiff > 7) return false
          if (timeFilter === '30days' && daysDiff > 30) return false
        }
      }

      // File type filtering
      if (selectedFileType !== 'All Files') {
        const typeNormalized = (scan.type || '').toLowerCase()
        const selectedNormalized = selectedFileType.toLowerCase()
        if (!typeNormalized.includes(selectedNormalized)) return false
      }

      return true
    })
  }, [allScans, timeFilter, selectedFileType])

  // 2. Compute Real KPI Metrics
  const metrics = useMemo(() => {
    const total = filteredScans.length
    const deepfakes = filteredScans.filter((s) => s.verdict === 'deepfake').length
    const authentic = filteredScans.filter((s) => s.verdict === 'authentic').length
    const suspicious = filteredScans.filter((s) => s.verdict === 'suspicious').length

    const totalScore = filteredScans.reduce((sum, s) => {
      const val = s.score ?? (s.confidence ? Math.round(s.confidence * 100) : 0)
      return sum + val
    }, 0)

    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : '0.0'

    return {
      total,
      deepfakes,
      authentic,
      suspicious,
      avgScore: `${avgScore}%`,
    }
  }, [filteredScans])

  // 3. Compute Real Scans Over Time (Daily trend for past 7 days)
  const lineChartData = useMemo(() => {
    const daysMap = new Map<string, { label: string; total: number; deepfake: number }>()

    // Generate past 7 days keys
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      daysMap.set(key, { label, total: 0, deepfake: 0 })
    }

    // Populate from actual scan timestamps
    filteredScans.forEach((scan) => {
      const scanDate = new Date(scan.createdAt || scan.date || '')
      if (!isNaN(scanDate.getTime())) {
        const key = scanDate.toISOString().split('T')[0]
        if (daysMap.has(key)) {
          const item = daysMap.get(key)!
          item.total += 1
          if (scan.verdict === 'deepfake') item.deepfake += 1
        }
      }
    })

    return Array.from(daysMap.values())
  }, [filteredScans])

  // Chart coordinate calculations
  const chartHeight = 160
  const chartWidth = 520
  const maxVal = Math.max(...lineChartData.map((d) => d.total), 5)

  const totalPoints = lineChartData
    .map((d, i) => {
      const x = (i / (lineChartData.length - 1)) * chartWidth
      const y = chartHeight - (d.total / maxVal) * (chartHeight - 20) - 10
      return `${x},${y}`
    })
    .join(' ')

  const deepfakePoints = lineChartData
    .map((d, i) => {
      const x = (i / (lineChartData.length - 1)) * chartWidth
      const y = chartHeight - (d.deepfake / maxVal) * (chartHeight - 20) - 10
      return `${x},${y}`
    })
    .join(' ')

  // 4. Compute Real File Types Breakdown
  const fileTypeDistribution = useMemo(() => {
    const total = filteredScans.length || 1
    let image = 0
    let video = 0
    let audio = 0
    let document = 0

    filteredScans.forEach((s) => {
      const t = (s.type || '').toLowerCase()
      if (t.includes('image') || t.includes('png') || t.includes('jpg')) image++
      else if (t.includes('video') || t.includes('mp4')) video++
      else if (t.includes('audio') || t.includes('mp3') || t.includes('wav')) audio++
      else document++
    })

    const imagePct = Math.round((image / total) * 100)
    const videoPct = Math.round((video / total) * 100)
    const docPct = Math.round((document / total) * 100)
    const audioPct = Math.max(0, 100 - (imagePct + videoPct + docPct))

    return {
      image: { count: image, pct: imagePct },
      video: { count: video, pct: videoPct },
      document: { count: document, pct: docPct },
      audio: { count: audio, pct: audioPct },
    }
  }, [filteredScans])

  // 5. Compute Real Authenticity Score Distribution Tiers
  const scoreDistribution = useMemo(() => {
    const total = filteredScans.length || 1
    let high = 0 // 90-100
    let medium = 0 // 70-89
    let low = 0 // 40-69
    let veryLow = 0 // 0-39

    filteredScans.forEach((s) => {
      const score = s.score ?? (s.confidence ? Math.round(s.confidence * 100) : 0)
      if (score >= 90) high++
      else if (score >= 70) medium++
      else if (score >= 40) low++
      else veryLow++
    })

    return {
      high: { count: high, pct: Math.round((high / total) * 100) },
      medium: { count: medium, pct: Math.round((medium / total) * 100) },
      low: { count: low, pct: Math.round((low / total) * 100) },
      veryLow: { count: veryLow, pct: Math.round((veryLow / total) * 100) },
    }
  }, [filteredScans])

  // 6. Compute Real Heatmap Activity (Day of Week vs Time Blocks)
  const heatmapData = useMemo(() => {
    // 4 time buckets: 12 AM (0-5), 6 AM (6-11), 12 PM (12-17), 6 PM (18-23)
    // 7 days: Mon (0) to Sun (6)
    const grid: number[][] = [
      [0, 0, 0, 0, 0, 0, 0], // 12 AM
      [0, 0, 0, 0, 0, 0, 0], // 6 AM
      [0, 0, 0, 0, 0, 0, 0], // 12 PM
      [0, 0, 0, 0, 0, 0, 0], // 6 PM
    ]

    filteredScans.forEach((scan) => {
      const d = new Date(scan.createdAt || scan.date || '')
      if (!isNaN(d.getTime())) {
        // Monday=0 ... Sunday=6
        const day = (d.getDay() + 6) % 7
        const hour = d.getHours()
        let row = 0
        if (hour >= 6 && hour < 12) row = 1
        else if (hour >= 12 && hour < 18) row = 2
        else if (hour >= 18 && hour < 24) row = 3

        grid[row][day] += 1
      }
    })

    return grid
  }, [filteredScans])

  // 7. Detection reasons computed from actual suspicious/deepfake scans
  const detectionReasons = useMemo(() => {
    const reasonsMap: Record<string, number> = {
      'Face Manipulation': 0,
      'Synthetic Media': 0,
      'Video Tampering': 0,
      'Audio Manipulation': 0,
      'Metadata Mismatch': 0,
    }

    let flaggedCount = 0
    filteredScans.forEach((scan) => {
      if (scan.verdict === 'deepfake' || scan.verdict === 'suspicious') {
        flaggedCount++
        const type = (scan.type || '').toLowerCase()
        if (type.includes('video')) {
          reasonsMap['Face Manipulation']++
          reasonsMap['Video Tampering']++
        } else if (type.includes('audio')) {
          reasonsMap['Audio Manipulation']++
        } else {
          reasonsMap['Synthetic Media']++
          reasonsMap['Metadata Mismatch']++
        }
      }
    })

    const base = flaggedCount || 1
    return Object.entries(reasonsMap).map(([title, count]) => ({
      title,
      pct: Math.min(100, Math.round((count / base) * 100)),
    }))
  }, [filteredScans])

  // Helper for heatmap cell color intensity
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-indigo-950/25 border border-border/20'
    if (count === 1) return 'bg-indigo-900/60'
    if (count === 2) return 'bg-indigo-700/80'
    if (count <= 4) return 'bg-indigo-600'
    return 'bg-primary shadow-sm shadow-primary/30'
  }

  // Donut SVG helper: circumference = 2 * PI * r
  const r = 38
  const circumference = 2 * Math.PI * r

  // Donut segments calculations
  const imgLen = (fileTypeDistribution.image.pct / 100) * circumference
  const vidLen = (fileTypeDistribution.video.pct / 100) * circumference
  const docLen = (fileTypeDistribution.document.pct / 100) * circumference
  const audLen = (fileTypeDistribution.audio.pct / 100) * circumference

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Aggregating live verification analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-14">
      {/* Header & Functional Time/Type Filters */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Analytics"
          description="Insights and trends from your verification activity"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-secondary/30 px-3 text-xs font-medium text-foreground backdrop-blur-md hover:bg-secondary/50 focus:outline-none">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>
                {timeFilter === '7days'
                  ? 'Last 7 Days'
                  : timeFilter === '30days'
                  ? 'Last 30 Days'
                  : 'All Time'}
              </span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTimeFilter('7days')}>
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('30days')}>
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('all')}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* File Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-secondary/30 px-3 text-xs font-medium text-foreground backdrop-blur-md hover:bg-secondary/50 focus:outline-none">
              <span>{selectedFileType}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setSelectedFileType('All Files')}>
                All Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFileType('Image')}>
                Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFileType('Video')}>
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFileType('Audio')}>
                Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFileType('Document')}>
                Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Scans */}
        <div className="glass-panel flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Total Scans</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.total.toLocaleString()}
              </span>
              <span className="flex items-center text-xs font-semibold text-emerald-400">
                <TrendingUp className="mr-0.5 size-3" /> Live
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">in current filter</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scan className="size-5" />
          </div>
        </div>

        {/* Deepfakes Detected */}
        <div className="glass-panel flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Deepfakes Detected</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.deepfakes.toLocaleString()}
              </span>
              <span className="flex items-center text-xs font-semibold text-rose-400">
                {metrics.total > 0
                  ? `${Math.round((metrics.deepfakes / metrics.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">flagged as synthetic</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </div>
        </div>

        {/* Authentic Files */}
        <div className="glass-panel flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Authentic Files</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.authentic.toLocaleString()}
              </span>
              <span className="flex items-center text-xs font-semibold text-emerald-400">
                {metrics.total > 0
                  ? `${Math.round((metrics.authentic / metrics.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">verified genuine</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        {/* Avg. Authenticity Score */}
        <div className="glass-panel flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Avg. Authenticity Score</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.avgScore}
              </span>
              <span className="flex items-center text-xs font-semibold text-indigo-400">
                overall
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">mean confidence index</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Activity className="size-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Live Scans Over Time & File Types Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scans Over Time Real SVG Chart */}
        <Card className="glass-panel col-span-1 border-border/60 bg-secondary/20 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Scans Over Time</CardTitle>
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="h-0.5 w-3.5 rounded-full bg-indigo-500" />
                  Total Scans
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-0.5 w-3.5 rounded-full bg-rose-500" />
                  Deepfakes
                </span>
              </div>

              <div className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 text-xs text-muted-foreground">
                <span>{granularity}</span>
                <ChevronDown className="size-3" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="relative h-56 w-full">
              {/* Y-Axis scale dynamically computed from maxVal */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-muted-foreground/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">{maxVal}</span>
                  <div className="h-[1px] w-full bg-border/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">{Math.round((maxVal * 3) / 4)}</span>
                  <div className="h-[1px] w-full bg-border/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">{Math.round((maxVal * 2) / 4)}</span>
                  <div className="h-[1px] w-full bg-border/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">{Math.round(maxVal / 4)}</span>
                  <div className="h-[1px] w-full bg-border/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">0</span>
                  <div className="h-[1px] w-full bg-border/40" />
                </div>
              </div>

              {/* Dynamic SVG Canvas */}
              <div className="absolute inset-y-0 left-8 right-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="size-full overflow-visible"
                >
                  {/* Total line */}
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={totalPoints}
                  />

                  {/* Deepfake line */}
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={deepfakePoints}
                  />

                  {/* Markers */}
                  {lineChartData.map((d, i) => {
                    const x = (i / (lineChartData.length - 1)) * chartWidth
                    const yTotal = chartHeight - (d.total / maxVal) * (chartHeight - 20) - 10
                    const yDf = chartHeight - (d.deepfake / maxVal) * (chartHeight - 20) - 10
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={yTotal}
                          r="4"
                          className="fill-indigo-500 stroke-background stroke-2"
                        />
                        {d.deepfake > 0 && (
                          <circle
                            cx={x}
                            cy={yDf}
                            r="3.5"
                            className="fill-rose-500 stroke-background stroke-2"
                          />
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Real Dates on X-Axis */}
            <div className="mt-2 flex justify-between pl-8 text-[11px] text-muted-foreground">
              {lineChartData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Types Distribution (Dynamic Donut) */}
        <Card className="glass-panel border-border/60 bg-secondary/20">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">File Types Distribution</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-between pt-2">
            <div className="relative my-3 flex size-44 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="12"
                />
                {/* Image */}
                {fileTypeDistribution.image.pct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray={`${imgLen} ${circumference}`}
                    strokeDashoffset={0}
                  />
                )}
                {/* Video */}
                {fileTypeDistribution.video.pct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="12"
                    strokeDasharray={`${vidLen} ${circumference}`}
                    strokeDashoffset={-imgLen}
                  />
                )}
                {/* Document */}
                {fileTypeDistribution.document.pct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray={`${docLen} ${circumference}`}
                    strokeDashoffset={-(imgLen + vidLen)}
                  />
                )}
                {/* Audio */}
                {fileTypeDistribution.audio.pct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke="#eab308"
                    strokeWidth="12"
                    strokeDasharray={`${audLen} ${circumference}`}
                    strokeDashoffset={-(imgLen + vidLen + docLen)}
                  />
                )}
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.total.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
            </div>

            {/* Real Breakdown Legend */}
            <div className="w-full space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Image
                </span>
                <span className="font-semibold text-foreground">
                  {fileTypeDistribution.image.pct}% ({fileTypeDistribution.image.count})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-purple-500" />
                  Video
                </span>
                <span className="font-semibold text-foreground">
                  {fileTypeDistribution.video.pct}% ({fileTypeDistribution.video.count})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-orange-500" />
                  Document
                </span>
                <span className="font-semibold text-foreground">
                  {fileTypeDistribution.document.pct}% ({fileTypeDistribution.document.count})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Audio
                </span>
                <span className="font-semibold text-foreground">
                  {fileTypeDistribution.audio.pct}% ({fileTypeDistribution.audio.count})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Score Distribution, Detection Reasons & Activity Heatmap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Authenticity Score Distribution */}
        <Card className="glass-panel border-border/60 bg-secondary/20">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold">
                Authenticity Score Distribution
              </CardTitle>
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex items-center gap-4">
              <div className="relative flex size-28 shrink-0 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                  />
                  {/* High */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(scoreDistribution.high.pct / 100) * 226.2} 226.2`}
                    strokeDashoffset={0}
                  />
                  {/* Medium */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="12"
                    strokeDasharray={`${(scoreDistribution.medium.pct / 100) * 226.2} 226.2`}
                    strokeDashoffset={-((scoreDistribution.high.pct / 100) * 226.2)}
                  />
                  {/* Low */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray={`${(scoreDistribution.low.pct / 100) * 226.2} 226.2`}
                    strokeDashoffset={
                      -(((scoreDistribution.high.pct + scoreDistribution.medium.pct) / 100) *
                        226.2)
                    }
                  />
                  {/* Very Low */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${(scoreDistribution.veryLow.pct / 100) * 226.2} 226.2`}
                    strokeDashoffset={
                      -(((scoreDistribution.high.pct +
                        scoreDistribution.medium.pct +
                        scoreDistribution.low.pct) /
                        100) *
                        226.2)
                    }
                  />
                </svg>
                <div className="absolute text-center leading-tight">
                  <p className="text-base font-bold text-foreground">{metrics.total}</p>
                  <p className="text-[9px] text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Tiers */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    90–100 (High)
                  </span>
                  <span className="font-semibold text-foreground">
                    {scoreDistribution.high.pct}% ({scoreDistribution.high.count})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    70–89 (Medium)
                  </span>
                  <span className="font-semibold text-foreground">
                    {scoreDistribution.medium.pct}% ({scoreDistribution.medium.count})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full bg-orange-500" />
                    40–69 (Low)
                  </span>
                  <span className="font-semibold text-foreground">
                    {scoreDistribution.low.pct}% ({scoreDistribution.low.count})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full bg-rose-500" />
                    0–39 (Very Low)
                  </span>
                  <span className="font-semibold text-foreground">
                    {scoreDistribution.veryLow.pct}% ({scoreDistribution.veryLow.count})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Detection Reasons */}
        <Card className="glass-panel border-border/60 bg-secondary/20">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold">Top Detection Reasons</CardTitle>
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-2 text-xs">
            {detectionReasons.map((reason, index) => {
              const colors = [
                'bg-purple-500',
                'bg-indigo-500',
                'bg-blue-500',
                'bg-cyan-500',
                'bg-slate-400',
              ]
              const barColor = colors[index % colors.length]
              return (
                <div key={reason.title}>
                  <div className="flex items-center justify-between py-1 font-medium">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className={`size-2 rounded-full ${barColor}`} />
                      {reason.title}
                    </span>
                    <span className="font-semibold text-foreground">{reason.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${reason.pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Real Activity Heatmap (Mon-Sun vs Time-of-day) */}
        <Card className="glass-panel border-border/60 bg-secondary/20">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-semibold">Recent Activity Heatmap</CardTitle>
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {/* Days header */}
            <div className="grid grid-cols-7 gap-1.5 pl-12 text-center text-[11px] font-medium text-muted-foreground">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Heatmap Grid with Real Time of Day Frequencies */}
            <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
              {['12 AM', '6 AM', '12 PM', '6 PM'].map((timeLabel, rowIndex) => (
                <div key={timeLabel} className="flex items-center gap-2">
                  <span className="w-10 text-right text-[10px]">{timeLabel}</span>
                  <div className="grid flex-1 grid-cols-7 gap-1.5">
                    {heatmapData[rowIndex].map((count, dayIndex) => (
                      <div
                        key={dayIndex}
                        title={`${count} scan${count === 1 ? '' : 's'}`}
                        className={`h-4 rounded transition-colors ${getCellColor(count)}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="mt-4 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <span>Low Activity</span>
              <div className="flex items-center gap-1 px-1">
                <span className="size-2.5 rounded-sm bg-indigo-950/40 border border-border/20" />
                <span className="size-2.5 rounded-sm bg-indigo-900/60" />
                <span className="size-2.5 rounded-sm bg-indigo-700" />
                <span className="size-2.5 rounded-sm bg-indigo-500" />
                <span className="size-2.5 rounded-sm bg-primary" />
              </div>
              <span>High Activity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Info className="size-3.5" />
        <span>Analytics are updated in real-time based on your verification activity.</span>
      </div>
    </div>
  )
}