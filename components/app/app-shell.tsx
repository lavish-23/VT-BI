'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <AppSidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <AppTopbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
