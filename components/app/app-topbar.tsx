'use client'

import Link from 'next/link'
import { Menu, Bell, Plus, Key } from 'lucide-react'
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

export function AppTopbar({ onMenu }: { onMenu?: () => void }) {
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

        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-secondary">
            <Avatar className="size-8">
              <AvatarFallback className="gradient-brand text-xs font-semibold text-primary-foreground">
                AM
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>My Profile</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/pricing" />}>Subscription</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/api" />}>
              <Key className="size-4 text-muted-foreground" />
              API Key
              <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                Premium
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/" />}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
