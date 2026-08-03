'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'

export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <Link href="/" aria-label="VeriTrust AI home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" render={<Link href="/pricing" />}>
            Pricing
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Login
          </Button>
          <Button
            size="sm"
            className="gradient-brand ml-1 text-primary-foreground"
            render={<Link href="/signup" />}
          >
            Sign Up Free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/50 bg-background/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Pricing
            </Link>
            <Button variant="outline" size="sm" render={<Link href="/login" />}>
              Login
            </Button>
            <Button size="sm" className="gradient-brand text-primary-foreground" render={<Link href="/signup" />}>
              Sign Up Free
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
