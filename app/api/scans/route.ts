import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { verifySession } from '@/lib/auth'
import User from '@/models/User'
import Scan, { MediaType } from '@/models/Scan'
import cloudinary from '@/lib/cloudinary'

function detectType(file: File): MediaType {
  const mime = file.type
  const name = file.name.toLowerCase()

  if (
    mime.startsWith('image/') ||
    /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/.test(name)
  ) {
    return 'image'
  }

  if (
    mime.startsWith('video/') ||
    /\.(mp4|mov|avi|mkv|webm|flv)$/.test(name)
  ) {
    return 'video'
  }

  if (
    mime.startsWith('audio/') ||
    /\.(mp3|wav|ogg|aac|flac|m4a)$/.test(name)
  ) {
    return 'audio'
  }

  return 'document'
}

function generateScanId() {
  const random = Math.floor(
    1000 + Math.random() * 9000
  )

  return `SCN-${random}`
}

export async function POST(request: NextRequest) {
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
    // 2. Connect MongoDB
    // -----------------------------------------

    await connectDB()

    // -----------------------------------------
    // 3. Verify user
    // -----------------------------------------

    const user = await User.findById(
      session.userId
    )

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    // -----------------------------------------
    // 4. Read uploaded file
    // -----------------------------------------

    const formData = await request.formData()

    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file uploaded',
        },
        { status: 400 }
      )
    }

    // -----------------------------------------
    // 5. Detect media type
    // -----------------------------------------

    const submittedType =
      formData.get('type')

    const fileType: MediaType =
      submittedType === 'image' ||
      submittedType === 'video' ||
      submittedType === 'audio' ||
      submittedType === 'document' ||
      submittedType === 'cross-modal'
        ? submittedType
        : detectType(file)

    // -----------------------------------------
    // 6. Generate unique scan ID
    // -----------------------------------------

    let scanId = generateScanId()

    let existingScan = await Scan.findOne({
      scanId,
    })

    while (existingScan) {
      scanId = generateScanId()

      existingScan = await Scan.findOne({
        scanId,
      })
    }

    // -----------------------------------------
    // 7. Upload file to Cloudinary
    // -----------------------------------------

    const arrayBuffer =
      await file.arrayBuffer()

    const buffer = Buffer.from(arrayBuffer)

    const uploadResult =
      await new Promise<{
        secure_url: string
        public_id: string
        resource_type: string
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: 'veritrust/scans',

              resource_type: 'auto',

              public_id: scanId,
            },

            (error, result) => {
              if (error) {
                reject(error)
                return
              }

              if (!result) {
                reject(
                  new Error(
                    'Cloudinary upload returned no result'
                  )
                )
                return
              }

              resolve({
                secure_url:
                  result.secure_url,

                public_id:
                  result.public_id,

                resource_type:
                  result.resource_type,
              })
            }
          )

        uploadStream.end(buffer)
      })

    console.log(
      'Cloudinary upload successful:',
      {
        scanId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType:
          uploadResult.resource_type,
      }
    )

    // -----------------------------------------
    // 8. Create Scan document
    // -----------------------------------------

    const scan = await Scan.create({
      userId: user._id,

      scanId,

      fileName: file.name,

      fileType,

      fileSize: file.size,

      mimeType:
        file.type ||
        'application/octet-stream',

      status: 'pending',

      fileUrl:
        uploadResult.secure_url,
    })

    // -----------------------------------------
    // 9. Return scan information
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          'Scan created and file uploaded successfully',

        scanId: scan.scanId,

        scan: {
          id: scan._id.toString(),

          scanId: scan.scanId,

          fileName: scan.fileName,

          fileType: scan.fileType,

          fileSize: scan.fileSize,

          mimeType: scan.mimeType,

          fileUrl: scan.fileUrl,

          status: scan.status,

          createdAt: scan.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'POST /api/scans error:',
      error
    )

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : 'Failed to create scan',
      },
      { status: 500 }
    )
  }
}