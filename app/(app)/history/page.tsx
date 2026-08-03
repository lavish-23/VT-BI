'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScansTable } from '@/components/app/scans-table'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { scanHistory, mediaLabels, verdictLabels } from '@/lib/mock-data'
import type { MediaType, Verdict } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const mediaOptions: { label: string; value: '' | MediaType }[] = [
  { label: 'All Types', value: '' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Document', value: 'document' },
  { label: 'Cross-Modal', value: 'cross-modal' },
]

const verdictOptions: { label: string; value: '' | Verdict }[] = [
  { label: 'All Verdicts', value: '' },
  { label: 'Genuine', value: 'authentic' },
  { label: 'Suspicious', value: 'suspicious' },
  { label: 'Deepfake', value: 'deepfake' },
]

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | MediaType>('')
  const [verdictFilter, setVerdictFilter] = useState<'' | Verdict>('')

  const filtered = useMemo(() => {
    return scanHistory.filter((r) => {
      const matchName = r.name.toLowerCase().includes(query.toLowerCase())
      const matchType = typeFilter ? r.type === typeFilter : true
      const matchVerdict = verdictFilter ? r.verdict === verdictFilter : true
      return matchName && matchType && matchVerdict
    })
  }, [query, typeFilter, verdictFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan History"
        description="Browse and filter all your past verifications."
      />

      {/* Filters */}
      <Card className="glass-panel">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by filename..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-secondary/40 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as '' | MediaType)}
              className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {mediaOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Verdict filter */}
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value as '' | Verdict)}
              className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {verdictOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Count */}
          <p className="mb-4 text-xs font-medium text-muted-foreground">
            Showing{' '}
            <span className="text-foreground">{filtered.length}</span> of{' '}
            <span className="text-foreground">{scanHistory.length}</span> scans
          </p>

          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4">File</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Type</th>
                    <th className="pb-3 pr-4">Score</th>
                    <th className="pb-3 pr-4">Verdict</th>
                    <th className="pb-3 pr-4 hidden md:table-cell">Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((r) => (
                    <tr key={r.id} className="group">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-foreground truncate max-w-[180px]">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.id}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground capitalize hidden sm:table-cell">
                        {mediaLabels[r.type]}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            'font-semibold tabular-nums',
                            r.score >= 70
                              ? 'text-success'
                              : r.score >= 45
                                ? 'text-warning'
                                : 'text-destructive',
                          )}
                        >
                          {r.score}%
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            r.verdict === 'authentic'
                              ? 'bg-success/12 text-success border-success/25'
                              : r.verdict === 'deepfake'
                                ? 'bg-destructive/12 text-destructive border-destructive/25'
                                : 'bg-warning/12 text-warning border-warning/25',
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {verdictLabels[r.verdict]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href="/report" />}
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(`PDF downloaded: ${r.name}`)}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No results found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
