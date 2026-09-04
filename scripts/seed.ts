import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local')
  process.exit(1)
}

const AnalysisCardSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    detail: { type: String, required: true },
    ok: { type: Boolean, required: true },
  },
  { _id: false }
)

const ScanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scanId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    status: { type: String, default: 'completed' },
    score: { type: Number },
    verdict: { type: String },
    threat: { type: String },
    action: { type: String },
    analysisCards: { type: [AnalysisCardSchema], default: [] },
    fileUrl: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
)

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
})

const Scan = mongoose.models.Scan || mongoose.model('Scan', ScanSchema)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

const sampleScans = [
  {
    fileName: 'cctv_hallway_feed_09.mp4',
    fileType: 'video',
    fileSize: 14205800,
    mimeType: 'video/mp4',
    score: 32,
    verdict: 'deepfake',
    threat: 'Temporal Frame Splicing / Face Swap',
    action: 'Flag or Restrict Content',
    daysAgo: 1,
    analysisCards: [
      { key: 'temporal_consistency', label: 'Temporal Sequence Stability', detail: 'Inter-frame variance: 24.3 (high jitter between frames)', ok: false },
      { key: 'frame_sampling', label: 'Multi-frame ML Classifier', detail: 'Evaluated 16 keyframe checkpoints via trained neural head.', ok: false },
      { key: 'surface_flicker', label: 'Surface Texture Continuity', detail: 'Inconsistent surface noise across video frames.', ok: false },
    ],
  },
  {
    fileName: 'executive_portrait_highres.jpg',
    fileType: 'image',
    fileSize: 3410900,
    mimeType: 'image/jpeg',
    score: 94,
    verdict: 'authentic',
    threat: 'None Detected',
    action: 'Content Appears Safe',
    daysAgo: 2,
    analysisCards: [
      { key: 'ml_inference', label: 'Neural Feature Classification', detail: 'Trained classifier predicted 94% authenticity probability.', ok: true },
      { key: 'ela', label: 'Error Level Analysis', detail: 'Compression levels uniform across image canvas.', ok: true },
      { key: 'fft', label: '2D Fourier Spectrum', detail: 'Natural camera optical noise profile.', ok: true },
      { key: 'surface_texture', label: 'Laplacian Surface Texture', detail: 'Variance score: 78.4 (natural texture).', ok: true },
    ],
  },
  {
    fileName: 'id_verification_card.png',
    fileType: 'image',
    fileSize: 1820400,
    mimeType: 'image/png',
    score: 58,
    verdict: 'suspicious',
    threat: 'Irregular Feature Anomalies',
    action: 'Manual Review Recommended',
    daysAgo: 3,
    analysisCards: [
      { key: 'ml_inference', label: 'Neural Feature Classification', detail: 'Trained classifier predicted 58% authenticity probability.', ok: false },
      { key: 'ela', label: 'Error Level Analysis', detail: 'Localized compression differential detected near photo box.', ok: false },
      { key: 'fft', label: '2D Fourier Spectrum', detail: 'Natural camera optical noise profile.', ok: true },
      { key: 'surface_texture', label: 'Laplacian Surface Texture', detail: 'Variance score: 44.1 (possible localized smoothing).', ok: false },
    ],
  },
  {
    fileName: 'employment_contract_q3.pdf',
    fileType: 'document',
    fileSize: 845200,
    mimeType: 'application/pdf',
    score: 91,
    verdict: 'authentic',
    threat: 'None Detected',
    action: 'Document Verified',
    daysAgo: 4,
    analysisCards: [
      { key: 'metadata_tool', label: 'Author & Tool Signature', detail: 'Verified native document generator signatures.', ok: true },
      { key: 'page_count', label: 'Document Object Tree', detail: 'Verified 4 document page tree stream(s).', ok: true },
    ],
  },
  {
    fileName: 'invoice_vendor_9921.pdf',
    fileType: 'document',
    fileSize: 420100,
    mimeType: 'application/pdf',
    score: 41,
    verdict: 'suspicious',
    threat: 'Automated Document Generation',
    action: 'Manual Inspection Recommended',
    daysAgo: 6,
    analysisCards: [
      { key: 'metadata_tool', label: 'Author & Tool Signature', detail: 'Generated via automated tool (reportlab).', ok: false },
      { key: 'page_count', label: 'Document Object Tree', detail: 'Verified 1 document page tree stream(s).', ok: true },
    ],
  },
  {
    fileName: 'press_briefing_audio_snippet.mp3',
    fileType: 'audio',
    fileSize: 2450800,
    mimeType: 'audio/mpeg',
    score: 28,
    verdict: 'deepfake',
    threat: 'Synthetic Voice Cloning Model',
    action: 'Flag or Restrict Content',
    daysAgo: 8,
    analysisCards: [
      { key: 'spectral_rolloff', label: 'Spectral Roll-off Distribution', detail: 'Abnormal high-frequency cutoff typical of vocoder synthesis.', ok: false },
      { key: 'pitch_jitter', label: 'Pitch Micro-Jitter', detail: 'Pitch contour lacks natural human vocal tract micro-perturbations.', ok: false },
    ],
  },
  {
    fileName: 'press_conference_clip_stage.mp4',
    fileType: 'video',
    fileSize: 22800400,
    mimeType: 'video/mp4',
    score: 89,
    verdict: 'authentic',
    threat: 'None Detected',
    action: 'Content Appears Safe',
    daysAgo: 11,
    analysisCards: [
      { key: 'temporal_consistency', label: 'Temporal Sequence Stability', detail: 'Inter-frame variance: 8.2 (consistent)', ok: true },
      { key: 'frame_sampling', label: 'Multi-frame ML Classifier', detail: 'Evaluated 16 keyframe checkpoints via trained neural head.', ok: true },
      { key: 'surface_flicker', label: 'Surface Texture Continuity', detail: 'Stable surface continuity observed.', ok: true },
    ],
  },
]

async function runSeed() {
  await mongoose.connect(MONGODB_URI!)
  console.log('Connected to MongoDB')

  // Find your active user
  const user = await User.findOne().sort({ _id: -1 })
  if (!user) {
    console.error('No user found in database. Register or log in via the web app first.')
    process.exit(1)
  }

  console.log(`Seeding scans for user: ${user._id} (${user.email || 'active user'})`)

  for (let i = 0; i < sampleScans.length; i++) {
    const item = sampleScans[i]
    const scanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - item.daysAgo)

    await Scan.create({
      userId: user._id,
      scanId,
      fileName: item.fileName,
      fileType: item.fileType,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      status: 'completed',
      score: item.score,
      verdict: item.verdict,
      threat: item.threat,
      action: item.action,
      analysisCards: item.analysisCards,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      createdAt: createdDate,
      updatedAt: createdDate,
    })

    console.log(`  Created ${item.verdict.toUpperCase()} scan [${item.fileType}]: ${scanId}`)
  }

  console.log('Seeding finished successfully.')
  await mongoose.disconnect()
}

runSeed().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})