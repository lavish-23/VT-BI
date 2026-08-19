'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadBox } from '@/components/upload-box'
import { ScansTable } from '@/components/app/scans-table'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { scanHistory } from '@/lib/mock-data'

const perks = [
  'Unlimited Verifications',
  'Cross-Modal Detection',
  'Priority Processing',
]

export default function ScanUploadPage() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleVerify = async () => {
    if (!file || uploading) return

    try {
      setUploading(true)

      const type = detectType(file)

      const formData = new FormData()

      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/scans', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to create scan'
        )
      }

      console.log('Scan created:', data.scan)

      router.push(
        `/processing?scanId=${encodeURIComponent(data.scanId)}&file=${encodeURIComponent(file.name)}&type=${encodeURIComponent(type)}`
      )
    } catch (error) {
      console.error('Upload failed:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload file'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="New Verification"
        description="Upload a file to run a full AI authenticity analysis."
      />

      {/* Upload area */}
      <div className="mx-auto max-w-2xl space-y-5">
        <UploadBox
          onFileSelect={setFile}
          className="min-h-[280px]"
        />

        {/* Perks row */}
        <div className="flex flex-wrap justify-center gap-4">
          {perks.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
              <CheckCircle2 className="size-4 text-success" />
              {p}
            </span>
          ))}
        </div>

        <Button
          size="lg"
          className="gradient-brand w-full text-primary-foreground"
          onClick={handleVerify}
          disabled={!file || uploading}
        >
          <ScanLine className="size-4" />

          {uploading
            ? 'Uploading...'
            : 'Verify Authenticity'}

          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Recent reports */}
      <Card className="glass-panel">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">
            Recent Reports
          </CardTitle>

          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/history" />}
          >
            View all
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>

        <CardContent>
          <ScansTable rows={scanHistory.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}

function detectType(file: File): string {
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