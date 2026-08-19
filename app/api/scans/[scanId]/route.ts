import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { verifySession } from '@/lib/auth'
import Scan from '@/models/Scan'

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      scanId: string
    }>
  }
) {
  try {
    // -----------------------------------------
    // 1. Check authentication
    // -----------------------------------------

    const token =
      request.cookies.get('veritrust_session')?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    const session = await verifySession(token)

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired session',
        },
        { status: 401 }
      )
    }

    // -----------------------------------------
    // 2. Get scan ID
    // -----------------------------------------

    const { scanId } = await context.params

    if (!scanId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Scan ID is required',
        },
        { status: 400 }
      )
    }

    // -----------------------------------------
    // 3. Connect MongoDB
    // -----------------------------------------

    await connectDB()

    // -----------------------------------------
    // 4. Find scan belonging to current user
    // -----------------------------------------

    const scan = await Scan.findOne({
      scanId,
      userId: session.userId,
    }).lean()

    if (!scan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Scan not found',
        },
        { status: 404 }
      )
    }

    // -----------------------------------------
    // 5. Return scan
    // -----------------------------------------

    return NextResponse.json({
      success: true,

      scan: {
        id: scan._id.toString(),

        scanId: scan.scanId,

        fileName: scan.fileName,

        fileType: scan.fileType,

        fileSize: scan.fileSize,

        mimeType: scan.mimeType,

        fileUrl: scan.fileUrl,

        status: scan.status,

        score: scan.score,

        verdict: scan.verdict,

        threat: scan.threat,

        action: scan.action,

        analysisCards:
          scan.analysisCards || [],

        createdAt: scan.createdAt,

        updatedAt: scan.updatedAt,
      },
    })
  } catch (error) {
    console.error(
      'GET /api/scans/[scanId] error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch scan',
      },
      { status: 500 }
    )
  }
}