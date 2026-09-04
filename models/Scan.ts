import mongoose, { Schema, Document } from 'mongoose'

export interface IAnalysisCard {
  key: string
  label: string
  detail: string
  ok: boolean
}

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId
  scanId: string
  fileName: string
  fileType: string
  fileSize: number
  mimeType: string
  status: string
  score?: number
  verdict?: string
  threat?: string
  action?: string
  analysisCards: IAnalysisCard[]
  visualArtifacts?: {
    ela_map?: string
    fft_spectrum?: string
  }
  fileUrl?: string
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

const AnalysisCardSchema = new Schema<IAnalysisCard>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    detail: { type: String, required: true },
    ok: { type: Boolean, required: true },
  },
  { _id: false }
)

const ScanSchema = new Schema<IScan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    visualArtifacts: {
      ela_map: { type: String },
      fft_spectrum: { type: String },
    },
    fileUrl: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema)