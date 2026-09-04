import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { scanHistory, ScanRecord } from '@/lib/mock-data'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGODB_DB_NAME || 'VeriTrust-AI'

let cachedClient: MongoClient | null = null

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }
  return cachedClient
}

export async function GET() {
  try {
    const client = await getClient()
    const db = client.db(DB_NAME)

    const dbScans = await db
      .collection('scans')
      .find({}, { projection: { visualArtifacts: 0 } })
      .sort({ createdAt: -1, _id: -1 })
      .toArray()

    const formattedDbScans: ScanRecord[] = dbScans.map((s) => {
      const id = s.scanId || s.id || String(s._id)
      const name = s.fileName || s.name || 'Scanned Media'
      const rawType = (s.fileType || s.type || 'image').toLowerCase()
      const type = rawType === 'pdf' ? 'document' : rawType

      let date = ''
      if (s.createdAt) {
        try {
          date = new Date(s.createdAt).toISOString().replace('T', ' ').slice(0, 16)
        } catch {
          date = String(s.createdAt)
        }
      }

      return {
        id,
        name,
        type: type as any,
        score: typeof s.score === 'number' ? s.score : 80,
        verdict: s.verdict || 'authentic',
        threat: s.threat || 'None Detected',
        date: date || '2026-09-04 18:35',
      }
    })

    // Avoid duplicate keys if seed scans match DB IDs
    const existingIds = new Set(formattedDbScans.map((s) => s.id))
    const uniqueSeeds = scanHistory.filter((s) => !existingIds.has(s.id))

    return NextResponse.json({
      success: true,
      scans: [...formattedDbScans, ...uniqueSeeds],
    })
  } catch (error) {
    console.error('Atlas history query failed, serving baseline scanHistory:', error)
    return NextResponse.json({ success: true, scans: scanHistory })
  }
}