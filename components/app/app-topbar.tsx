'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Plus, Key, LogOut, Loader2 } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type User = {
  id: string
  firstName: string
  lastName: string
  organization: string
  email: string
  provider: 'credentials' | 'google'
}

export function AppTopbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [])

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        router.replace('/login')
        router.refresh()
      } else {
        console.error('Logout failed')
        setLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout request failed:', error)
      setLoggingOut(false)
    }
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '--'

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Loading...'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Nav links (shown on md+) */}
      <nav className="hidden items-center gap-1 md:flex">
        <Link
          href="/scan/upload"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          New Verification
        </Link>

        <Link
          href="/history"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          History
        </Link>

        <Link
          href="/pricing"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Pricing
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          className="gradient-brand hidden text-primary-foreground sm:inline-flex"
          render={<Link href="/scan/upload" />}
        >
          <Plus className="size-4" />
          New Verification
        </Button>

        <button
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary"
          aria-label="Notifications"
        >
          <Bell className="size-5" />

          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-secondary"
            disabled={loadingUser}
          >
            <Avatar className="size-8">
              <AvatarFallback className="gradient-brand text-xs font-semibold text-primary-foreground">
                {loadingUser ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>

            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-medium">
                {fullName}
              </p>

              <p className="text-xs text-muted-foreground">
                {user?.organization || 'VeriTrust'}
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user ? fullName : 'My Account'}</span>

                {user && (
                  <span className="mt-1 text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem render={<Link href="/profile" />}>
              My Profile
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link href="/pricing" />}>
              Subscription
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link href="/api" />}>
              <Key className="size-4 text-muted-foreground" />
              API Key

              <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                Premium
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-destructive focus:text-destructive"
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}

              {loggingOut ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}