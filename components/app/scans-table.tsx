import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MediaIcon, VerdictBadge, scoreColor } from "@/components/app/media-bits"
import { mediaLabels, type ScanRecord } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function ScansTable({ rows, showThreat = true }: { rows: ScanRecord[]; showThreat?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>File</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Verdict</TableHead>
          {showThreat && <TableHead className="hidden md:table-cell">Threat</TableHead>}
          <TableHead className="hidden sm:table-cell">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} className="group cursor-pointer">
            <TableCell>
              <Link href="/report" className="flex flex-col">
                <span className="font-medium transition-colors group-hover:text-primary">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.id}</span>
              </Link>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MediaIcon type={r.type} />
                <span className="hidden lg:inline">{mediaLabels[r.type]}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className={cn("font-semibold tabular-nums", scoreColor(r.score))}>{r.score}%</span>
            </TableCell>
            <TableCell>
              <VerdictBadge verdict={r.verdict} />
            </TableCell>
            {showThreat && (
              <TableCell className="hidden md:table-cell">
                <span className={cn("text-sm", r.threat === "None" ? "text-muted-foreground" : "text-foreground")}>
                  {r.threat}
                </span>
              </TableCell>
            )}
            <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground sm:table-cell">
              {r.date}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
