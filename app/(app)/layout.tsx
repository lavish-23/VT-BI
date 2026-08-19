import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AppShell } from '@/components/app/app-shell'
import { verifySession } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const token = cookieStore.get('veritrust_session')?.value

  if (!token) {
    redirect('/login')
  }

  const session = await verifySession(token)

  if (!session) {
    redirect('/login')
  }

  return <AppShell>{children}</AppShell>
}