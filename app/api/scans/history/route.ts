import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb' // <-- If this has squiggly lines, remove { }
import Scan from '@/models/Scan'
import { verifySession } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('veritrust_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No session cookie' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 })
    }

    await connectDB()

    const scans = await Scan.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .lean()

    const formattedScans = scans.map((s) => ({
      id: s.scanId || s._id.toString(),
      name: s.fileName,
      type: s.fileType,
      score: s.score ?? 0,
      verdict: s.verdict || (s.status === 'pending' ? 'suspicious' : 'authentic'),
      threat: s.threat || 'None',
      date: new Date(s.createdAt).toISOString().replace('T', ' ').slice(0, 16),
      status: s.status,
    }))

    return NextResponse.json({ scans: formattedScans }, { status: 200 })
  } catch (error) {
    console.error('Failed to retrieve scan history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}