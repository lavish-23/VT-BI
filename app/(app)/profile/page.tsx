'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Building2,
  Copy,
  RefreshCw,
  LogOut,
  Pencil,
  CheckCircle2,
  Key,
  Crown,
  ScanLine,
  ShieldAlert,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const planFeatures = [
  'Unlimited Verifications',
  'Cross-Modal Detection',
  'Detailed AI Explanations',
  'Downloadable PDF Reports',
  'Scan History (90 days)',
  'Priority Processing',
  'API Access',
  'Video & Audio support',
  'SOC 2 aligned',
]

const stats = [
  { label: 'Total Scans', value: '4,821', icon: ScanLine },
  { label: 'Deepfakes Found', value: '612', icon: ShieldAlert },
  { label: 'Plan Since', value: 'Jan 2026', icon: Calendar },
]

const MASKED_KEY = 'vtai_sk_••••••••••••••••••••••••••••••••'
const REAL_KEY = 'vtai_sk_8xKp2mQR9nLwVjXtYcBzFeAs7dHgNuWo'

export default function ProfilePage() {
  const router = useRouter()
  const [keyCopied, setKeyCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const copyKey = async () => {
    await navigator.clipboard.writeText(REAL_KEY)
    setKeyCopied(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const regenerateKey = () => {
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      toast.success('API key regenerated successfully')
    }, 1200)
  }

  const handleLogout = () => {
    router.push('/')
    toast.success('Logged out successfully')
  }

  const handleEdit = () => {
    toast.success('Profile updated')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account settings and API access."
        action={
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass rounded-2xl border border-border/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Icon className="size-3.5" />
                {s.label}
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User info */}
        <Card className="glass-panel lg:col-span-1">
          <CardContent className="pt-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="gradient-brand grid size-20 place-items-center rounded-2xl shadow-lg shadow-primary/25 text-3xl font-bold text-primary-foreground">
                A
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Alex Morgan</h2>
              <p className="text-sm text-muted-foreground">alex@northbank.com</p>

              <div className="mt-2 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">NorthBank</span>
              </div>

              {/* Plan badge */}
              <div className="mt-4">
                <span className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                  <Crown className="size-3" />
                  Premium Plan
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="mt-5 w-full"
                onClick={handleEdit}
              >
                <Pencil className="size-3.5" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan + API */}
        <div className="space-y-6 lg:col-span-2">
          {/* Plan features */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Premium Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="size-4 text-primary" />
                API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Use this key to authenticate requests to the VeriTrust AI API.
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
                <code className="flex-1 truncate font-mono text-xs text-foreground">
                  {MASKED_KEY}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyKey}
                  className={cn(keyCopied && 'text-success')}
                >
                  {keyCopied ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={regenerateKey}
                disabled={regenerating}
              >
                <RefreshCw className={cn('size-3.5', regenerating && 'animate-spin')} />
                {regenerating ? 'Regenerating...' : 'Regenerate Key'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Keep this key secret. Do not share it in public repositories.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
