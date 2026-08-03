// Pure CSS tab pivot — no JavaScript, no React state, no hydration issues.

import {
  UploadCloud,
  Cpu,
  FileCheck2,
  ImageIcon,
  Video,
  AudioLines,
  FileText,
  Layers,
  BrainCircuit,
  Gauge,
  Download,
} from 'lucide-react'

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload any media',
    text: 'Drop images, video, audio or documents — or several at once for cross-modal analysis.',
    accent: 'from-blue-500/20 to-violet-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    number: '01',
    tag: 'Step 1',
  },
  {
    icon: Cpu,
    title: 'AI analyzes every signal',
    text: 'Metadata, artifacts, face, voice and OCR models run in parallel across modalities.',
    accent: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15',
    number: '02',
    tag: 'Step 2',
  },
  {
    icon: FileCheck2,
    title: 'Get an actionable verdict',
    text: 'Receive a unified authenticity score, threat category and clear recommended action.',
    accent: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    number: '03',
    tag: 'Step 3',
  },
]

const featureList = [
  {
    icon: ImageIcon,
    label: 'Image Deepfake Detection',
    desc: 'GAN & diffusion artifact detection with noise fingerprinting.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    icon: Video,
    label: 'Video Deepfake Detection',
    desc: 'Face-swap, lip-sync and temporal flicker analysis frame by frame.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-violet-500/20',
  },
  {
    icon: AudioLines,
    label: 'Audio Clone Detection',
    desc: 'Voice-clone detection via spectral and breathing-pattern analysis.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    glow: 'hover:shadow-pink-500/20',
  },
  {
    icon: FileText,
    label: 'Document Forgery Detection',
    desc: 'OCR verification, forgery indicators and metadata provenance checks.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/20',
  },
  {
    icon: Layers,
    label: 'Cross-Modal Verification',
    desc: 'Correlate identity signals across files to expose coordinated fakes.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'hover:shadow-cyan-500/20',
  },
  {
    icon: BrainCircuit,
    label: 'AI Explainability',
    desc: 'Clear breakdown of every signal the model used to reach its verdict.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/20',
  },
  {
    icon: Gauge,
    label: 'Instant Authenticity Score',
    desc: 'Unified 0–100 score with risk badge and recommended action.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'hover:shadow-orange-500/20',
  },
  {
    icon: Download,
    label: 'Downloadable PDF Reports',
    desc: 'Share audit-ready reports with your team or clients instantly.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    glow: 'hover:shadow-teal-500/20',
  },
]

export function PivotSection() {
  return (
    <section id="how" className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-border bg-secondary/40 px-5 py-2 text-base font-semibold text-accent">
            Explore
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
            How it works &amp; what you get
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Everything from upload to verdict — and every capability built in.
          </p>
        </div>

        <div className="pivot-root mt-10">

          {/* Hidden radio inputs */}
          <input type="radio" id="pivot-how" name="pivot-tabs" defaultChecked className="pivot-radio" />
          <input type="radio" id="pivot-features" name="pivot-tabs" className="pivot-radio" />

          {/* Tab bar */}
          <div className="pivot-tab-bar flex justify-center">
            <div className="inline-flex rounded-full bg-secondary/60 p-1.5 gap-1">
              <label htmlFor="pivot-how" className="pivot-label pivot-label-how rounded-full px-8 py-3 text-base font-semibold cursor-pointer transition-all duration-200 text-muted-foreground select-none">
                How It Works
              </label>
              <label htmlFor="pivot-features" className="pivot-label pivot-label-features rounded-full px-8 py-3 text-base font-semibold cursor-pointer transition-all duration-200 text-muted-foreground select-none">
                Features
              </label>
            </div>
          </div>

          {/* ── How It Works panel ── */}
          <div className="pivot-panel-how mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.title}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${s.accent} p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10`}
              >
                {/* Large faded step number watermark */}
                <span className="pointer-events-none absolute -right-2 -top-3 font-black text-[72px] leading-none text-white/5 select-none">
                  {s.number}
                </span>

                {/* Step tag */}
                <span className="mb-4 inline-block rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.tag}
                </span>

                {/* Icon */}
                <div className={`grid size-13 place-items-center rounded-2xl ${s.iconBg} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className={`size-6 ${s.iconColor}`} strokeWidth={1.8} />
                </div>

                {/* Connector line between cards (hidden on last) */}
                <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>

                {/* Bottom glow line */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* ── Features panel ── */}
          <div className="pivot-panel-features mt-12 grid gap-4 sm:grid-cols-2">
            {featureList.map((f) => (
              <div
                key={f.label}
                className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${f.glow}`}
              >
                {/* Gradient top-left corner accent */}
                <div className={`pointer-events-none absolute -left-4 -top-4 size-20 rounded-full ${f.bg} blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative flex items-start gap-4">
                  {/* Icon box */}
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${f.border} ${f.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <f.icon className={`size-5 ${f.color}`} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground leading-snug">{f.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>

                {/* Bottom glow line on hover */}
                <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-60`} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
