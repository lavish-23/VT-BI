import mongoose, { Schema, Model } from 'mongoose'

export type MediaType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'cross-modal'

export type ScanStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export type Verdict =
  | 'authentic'
  | 'suspicious'
  | 'deepfake'

export interface IAnalysisCard {
  key: string
  label: string
  detail: string
  ok: boolean
}

export interface IScan {
  userId: mongoose.Types.ObjectId

  scanId: string

  fileName: string
  fileType: MediaType
  fileSize: number
  mimeType: string

  status: ScanStatus

  score?: number
  verdict?: Verdict

  threat?: string
  action?: string

  analysisCards?: IAnalysisCard[]

  fileUrl?: string

  errorMessage?: string

  createdAt: Date
  updatedAt: Date
}

const AnalysisCardSchema = new Schema<IAnalysisCard>(
  {
    key: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    detail: {
      type: String,
      required: true,
    },

    ok: {
      type: Boolean,
      required: true,
    },
  },
  {
    _id: false,
  }
)

const ScanSchema = new Schema<IScan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    scanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: [
        'image',
        'video',
        'audio',
        'document',
        'cross-modal',
      ],
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'completed',
        'failed',
      ],
      default: 'pending',
      required: true,
      index: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    verdict: {
      type: String,
      enum: [
        'authentic',
        'suspicious',
        'deepfake',
      ],
    },

    threat: {
      type: String,
    },

    action: {
      type: String,
    },

    analysisCards: {
      type: [AnalysisCardSchema],
      default: [],
    },

    fileUrl: {
      type: String,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Scan: Model<IScan> =
  mongoose.models.Scan ||
  mongoose.model<IScan>('Scan', ScanSchema)

export default Scan