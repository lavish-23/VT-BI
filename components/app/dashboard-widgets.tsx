import Link from "next/link"
import { AlertTriangle, ArrowRight, Lightbulb, ScanLine, ShieldCheck, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MediaIcon } from "@/components/app/media-bits"
import { liveFeed, securityTips, latestThreats, type MediaType } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const levelStyle: Record<string, string> = {
  high: "bg-destructive/12 text-destructive border-destructive/25",
  medium: "bg-warning/12 text-warning border-warning/25",
  low: "bg-success/12 text-success border-success/25",
}

export function LiveThreatFeed() {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
          </span>
          Live Threat Feed
        </CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/threats" />}>
          Open SOC
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {liveFeed.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/60">
              <MediaIcon type={item.type as MediaType} className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                {item.region} · {item.time}
              </p>
            </div>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", levelStyle[item.level])}>
              {item.level}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const actions = [
  { href: "/scan/upload", label: "New Scan", desc: "Upload media to verify", icon: ScanLine },
  { href: "/report", label: "View Report", desc: "Latest detection result", icon: ShieldCheck },
  { href: "/analytics", label: "Analytics", desc: "Trends & insights", icon: TrendingUp },
  { href: "/threats", label: "Threat Intel", desc: "Global SOC feed", icon: AlertTriangle },
]

export function QuickActions() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-secondary/40 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/70"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <a.icon className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export function SecurityTips() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4 text-warning" />
          Security Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {securityTips.map((tip, i) => (
          <div key={i} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {i + 1}
            </span>
            <p className="text-pretty">{tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function EmergingThreats() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-base">Emerging Threats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestThreats.map((t) => (
          <div key={t.title} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  t.level === "high" ? "bg-destructive" : "bg-warning",
                )}
              />
              <p className="text-sm text-pretty">{t.title}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-destructive">{t.delta}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
