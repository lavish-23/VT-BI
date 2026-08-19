import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { verifySession } from '@/lib/auth'
import Scan from '@/models/Scan'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    // -----------------------------------------
    // 1. Check authentication
    // -----------------------------------------

    const token = request.cookies.get('veritrust_session')?.value

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

    const { scanId } = await params

    // -----------------------------------------
    // 3. Connect database
    // -----------------------------------------

    await connectDB()

    // -----------------------------------------
    // 4. Find scan belonging to current user
    // -----------------------------------------

    const scan = await Scan.findOne({
      scanId,
      userId: session.userId,
    })

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
    // 5. Set processing
    // -----------------------------------------

    scan.status = 'processing'
    await scan.save()

    // -----------------------------------------
    // 6. TEMPORARY AI ANALYSIS
    //
    // This is only a placeholder.
    // Later we will connect Python AI here.
    // -----------------------------------------

    const score = generateScore(scan.fileName)

    let verdict: 'authentic' | 'suspicious' | 'deepfake'

    if (score >= 68) {
      verdict = 'authentic'
    } else if (score >= 42) {
      verdict = 'suspicious'
    } else {
      verdict = 'deepfake'
    }

    const analysisCards = generateAnalysisCards(
      scan.fileType,
      score
    )

    let threat = 'None'
    let action = 'Content Appears Safe'

    if (verdict === 'deepfake') {
      threat = 'Synthetic Media / Deepfake'
      action = 'Do Not Trust — Report Content'
    }

    if (verdict === 'suspicious') {
      threat = 'Possible AI Generation'
      action = 'Verify Manually Before Sharing'
    }

    // -----------------------------------------
    // 7. Save final result
    // -----------------------------------------

    scan.status = 'completed'
    scan.score = score
    scan.verdict = verdict
    scan.threat = threat
    scan.action = action
    scan.analysisCards = analysisCards

    await scan.save()

    // -----------------------------------------
    // 8. Return result
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      message: 'Scan completed successfully',

      scan: {
        scanId: scan.scanId,
        fileName: scan.fileName,
        fileType: scan.fileType,
        status: scan.status,
        score: scan.score,
        verdict: scan.verdict,
        threat: scan.threat,
        action: scan.action,
        analysisCards: scan.analysisCards,
      },
    })
  } catch (error) {
    console.error(
      'POST /api/scans/[scanId]/complete error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to complete scan',
      },
      { status: 500 }
    )
  }
}

// -----------------------------------------
// Temporary score generator
// -----------------------------------------

function generateScore(fileName: string): number {
  let hash = 0

  for (let i = 0; i < fileName.length; i++) {
    hash =
      (hash << 5) -
      hash +
      fileName.charCodeAt(i)

    hash |= 0
  }

  return 15 + (Math.abs(hash) % 78)
}

// -----------------------------------------
// Temporary analysis cards
// -----------------------------------------

function generateAnalysisCards(
  fileType: string,
  score: number
) {
  const ok = (threshold: number) =>
    score > threshold

  if (fileType === 'image') {
    return [
      {
        key: 'face',
        label: 'Face Swap Detection',
        detail: ok(60)
          ? 'No face manipulation detected'
          : 'Face swap artifacts detected',
        ok: ok(60),
      },
      {
        key: 'gan',
        label: 'GAN / AI Generation',
        detail: ok(55)
          ? 'Image is consistent with a real photograph'
          : 'AI generation patterns detected',
        ok: ok(55),
      },
      {
        key: 'meta',
        label: 'Metadata Integrity',
        detail: ok(50)
          ? 'EXIF data intact and consistent'
          : 'Metadata modified or stripped',
        ok: ok(50),
      },
      {
        key: 'compress',
        label: 'Compression Anomalies',
        detail: ok(65)
          ? 'Natural compression patterns observed'
          : 'Irregular compression blocks detected',
        ok: ok(65),
      },
    ]
  }

  if (fileType === 'video') {
    return [
      {
        key: 'deepfake',
        label: 'Deepfake Frame Analysis',
        detail: ok(60)
          ? 'No deepfake indicators detected'
          : 'Deepfake markers detected in frames',
        ok: ok(60),
      },
      {
        key: 'avsync',
        label: 'Audio-Visual Sync',
        detail: ok(55)
          ? 'Lip-sync and audio are consistent'
          : 'Audio / visual desync detected',
        ok: ok(55),
      },
      {
        key: 'temporal',
        label: 'Temporal Consistency',
        detail: ok(65)
          ? 'Frame transitions verified'
          : 'Temporal inconsistencies detected',
        ok: ok(65),
      },
      {
        key: 'voice',
        label: 'Voice Clone Detection',
        detail: ok(58)
          ? 'Voice characteristics appear genuine'
          : 'Possible AI-cloned voice detected',
        ok: ok(58),
      },
    ]
  }

  if (fileType === 'audio') {
    return [
      {
        key: 'clone',
        label: 'Voice Clone Detection',
        detail: ok(60)
          ? 'Voice patterns appear authentic'
          : 'Possible AI-cloned voice detected',
        ok: ok(60),
      },
      {
        key: 'synth',
        label: 'Speech Synthesis Check',
        detail: ok(55)
          ? 'Natural speech patterns detected'
          : 'Synthetic speech patterns detected',
        ok: ok(55),
      },
      {
        key: 'noise',
        label: 'Background Noise Analysis',
        detail: ok(65)
          ? 'Natural ambient noise verified'
          : 'Artificial or edited background audio',
        ok: ok(65),
      },
      {
        key: 'speaker',
        label: 'Speaker Verification',
        detail: ok(58)
          ? 'Consistent speaker identity'
          : 'Speaker identity inconsistencies found',
        ok: ok(58),
      },
    ]
  }

  return [
    {
      key: 'meta',
      label: 'Metadata Tampering',
      detail: ok(60)
        ? 'Document metadata is unmodified'
        : 'Creation / modification dates altered',
      ok: ok(60),
    },
    {
      key: 'aitext',
      label: 'AI-Generated Content',
      detail: ok(55)
        ? 'Natural authorship patterns detected'
        : 'AI-generated content detected',
      ok: ok(55),
    },
    {
      key: 'sig',
      label: 'Digital Signature',
      detail: ok(65)
        ? 'Digital signatures valid'
        : 'Signature absent or invalid',
      ok: ok(65),
    },
    {
      key: 'source',
      label: 'Source Verification',
      detail: ok(58)
        ? 'Document origin appears legitimate'
        : 'Source origin could not be verified',
      ok: ok(58),
    },
  ]
}