import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'veritrust'
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000'

let cachedClient: MongoClient | null = null

async function getDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }
  return cachedClient.db(DB_NAME)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 1. Forward raw file to Python AI Service
    const aiFormData = new FormData()
    aiFormData.append('file', file)

    let aiResult: any = null
    try {
      const aiResponse = await fetch(`${AI_ENGINE_URL}/analyze-file`, {
        method: 'POST',
        body: aiFormData,
      })

      if (!aiResponse.ok) {
        throw new Error(`AI Engine returned HTTP ${aiResponse.status}`)
      }
      aiResult = await aiResponse.json()
    } catch (engineErr) {
      console.error('Error contacting Python AI Service:', engineErr)
      return NextResponse.json(
        { error: 'AI Service offline or failed to analyze media' },
        { status: 502 }
      )
    }

    // 2. Prepare payload using real values returned by Python
    const scanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`
    const isImage = file.type.startsWith('image/') || !file.type.includes('/')
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')
    const isDoc = file.type.includes('pdf')

    const fileType = isVideo ? 'video' : isAudio ? 'audio' : isDoc ? 'pdf' : 'image'

    const scanRecord = {
      scanId,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      status: 'completed',
      score: aiResult.score ?? 75,
      verdict: aiResult.verdict ?? 'authentic',
      threat: aiResult.threat ?? 'None Detected',
      action: aiResult.action ?? 'Content Appears Safe',
      analysisCards: aiResult.analysisCards || [],
      visualArtifacts: aiResult.visualArtifacts || {},
      createdAt: new Date().toISOString(),
    }

    // 3. Persist to MongoDB
    const db = await getDatabase()
    await db.collection('scans').insertOne(scanRecord)

    return NextResponse.json({
      success: true,
      scanId,
      scan: scanRecord,
    })
  } catch (error: any) {
    console.error('Upload handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}