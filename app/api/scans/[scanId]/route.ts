import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

let cachedClient: MongoClient | null = null

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }
  return cachedClient
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id?: string }> | { id?: string } }
) {
  try {
    const resolvedParams = 'then' in context.params ? await context.params : context.params
    let rawId = resolvedParams?.id

    if (!rawId) {
      const urlParts = req.nextUrl.pathname.split('/').filter(Boolean)
      rawId = urlParts[urlParts.length - 1]
    }

    rawId = decodeURIComponent(rawId || '').trim()

    if (!rawId || rawId === 'undefined' || rawId === 'null') {
      return NextResponse.json({ success: false, message: 'Missing scan ID' }, { status: 400 })
    }

    const client = await getClient()
    const targetDbs = ['VeriTrust-AI', 'veritrust']
    let scan: any = null

    const queryConditions: any[] = [
      { scanId: rawId },
      { scanId: rawId.toUpperCase() },
      { id: rawId },
    ]

    if (ObjectId.isValid(rawId)) {
      queryConditions.push({ _id: new ObjectId(rawId) })
    }

    for (const dbName of targetDbs) {
      const db = client.db(dbName)
      scan = await db.collection('scans').findOne({ $or: queryConditions })
      if (scan) break
    }

    if (!scan) {
      return NextResponse.json(
        { success: false, message: `Scan '${rawId}' not found in database` },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, scan })
  } catch (error: any) {
    console.error('Fetch scan error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}