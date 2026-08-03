'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 900)
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/15">
            <MailCheck className="size-7 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We&apos;ve sent a password reset link to your email. It expires in 30 minutes.
          </p>
          <Button className="mt-8 w-full" render={<Link href="/login" />}>
            <ArrowLeft className="size-4" />
            Back to sign in
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-brand text-primary-foreground">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send reset link
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  )
}
