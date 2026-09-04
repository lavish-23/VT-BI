import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000'
const DB_NAME = process.env.MONGODB_DB_NAME || 'VeriTrust-AI'

let cachedClient: MongoClient | null = null

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }
  return cachedClient
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const aiFormData = new FormData()
    aiFormData.append('file', file)

    let aiResult: any = null
    try {
      const aiResponse = await fetch(`${AI_ENGINE_URL}/analyze-file`, {
        method: 'POST',
        body: aiFormData,
      })

      if (!aiResponse.ok) {
        throw new Error(`AI Engine status ${aiResponse.status}`)
      }
      aiResult = await aiResponse.json()
    } catch (engineErr: any) {
      console.error('AI Service error:', engineErr.message)
      return NextResponse.json(
        { success: false, error: 'AI Service offline (verify uvicorn is running on :8000)' },
        { status: 502 }
      )
    }

    const scanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')
    const isDoc = file.type.includes('pdf')
    const fileType = isVideo ? 'video' : isAudio ? 'audio' : isDoc ? 'document' : 'image'

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

    const client = await getClient()
    await client.db(DB_NAME).collection('scans').insertOne(scanRecord)

    return NextResponse.json({
      success: true,
      scanId,
      scan: scanRecord,
    })
  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}