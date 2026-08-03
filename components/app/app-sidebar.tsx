'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScanLine,
  FileSearch,
  History,
  BarChart3,
  ShieldAlert,
  Code2,
  UserCog,
  LifeBuoy,
  X,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan/upload', label: 'New Scan', icon: ScanLine },
  { href: '/report', label: 'Detection Report', icon: FileSearch },
  { href: '/history', label: 'Scan History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/threats', label: 'Threat Intelligence', icon: ShieldAlert },
  { href: '/api', label: 'Developer API', icon: Code2 },
  { href: '/profile', label: 'Profile', icon: UserCog },
]

export function AppSidebar({
  open,
  onClose,
}: {
  open?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" aria-label="VeriTrust AI home">
            <Logo size="sm" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-[18px] transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LifeBuoy className="size-4 text-primary" />
              Enterprise Support
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              24/7 SOC assistance for your verification workloads.
            </p>
            <button className="gradient-brand mt-3 w-full rounded-lg py-2 text-xs font-semibold text-primary-foreground">
              Contact Team
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
