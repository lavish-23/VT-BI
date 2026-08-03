'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Banknote,
  Newspaper,
  UserX,
  Landmark,
  UploadCloud,
  Cpu,
  FileCheck2,
  ImageIcon,
  Video,
  AudioLines,
  FileText,
  Layers,
  ShieldCheck,
  Lock,
  Gauge,
  Globe,
  ArrowRight,
  Quote,
  CheckCircle2,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-block rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-accent">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </div>
  )
}

const threats = [
  { icon: UserX, title: 'Identity Fraud', text: 'Synthetic faces and cloned voices bypass onboarding and KYC checks.' },
  { icon: Banknote, title: 'Financial Scams', text: 'Deepfake CEO calls authorize fraudulent wire transfers in seconds.' },
  { icon: Newspaper, title: 'Fake News', text: 'Fabricated broadcasts and images spread disinformation at scale.' },
  { icon: Landmark, title: 'Government Forgery', text: 'AI-forged permits, IDs and official documents erode public trust.' },
]

const steps = [
  { icon: UploadCloud, title: 'Upload any media', text: 'Drop images, video, audio or documents — or several at once for cross-modal analysis.' },
  { icon: Cpu, title: 'AI analyzes every signal', text: 'Metadata, artifacts, face, voice and OCR models run in parallel across modalities.' },
  { icon: FileCheck2, title: 'Get an actionable verdict', text: 'Receive a unified authenticity score, threat category and clear recommended action.' },
]

const media = [
  { icon: ImageIcon, title: 'Images', formats: 'PNG · JPEG', text: 'GAN & diffusion artifact detection, AI watermark and noise fingerprinting.' },
  { icon: Video, title: 'Video', formats: 'MP4 · MOV', text: 'Face-swap, lip-sync and temporal flicker analysis frame by frame.' },
  { icon: AudioLines, title: 'Audio', formats: 'MP3 · WAV', text: 'Voice-clone detection via spectral and breathing-pattern analysis.' },
  { icon: FileText, title: 'Documents', formats: 'PDF · DOCX', text: 'OCR verification, forgery indicators and metadata provenance checks.' },
  { icon: Layers, title: 'Cross-Modal', formats: 'Any combination', text: 'Correlate identity signals across files to expose coordinated fakes.' },
]

const benefits = [
  { icon: ShieldCheck, title: 'Enterprise-grade accuracy', text: 'Ensemble models tuned on millions of authentic and synthetic samples.' },
  { icon: Lock, title: 'SOC 2 & privacy-first', text: 'Encrypted in transit and at rest with configurable data retention.' },
  { icon: Gauge, title: 'Real-time at scale', text: 'Sub-second verdicts through a high-throughput developer API.' },
  { icon: Globe, title: 'Global threat intelligence', text: 'A live feed of emerging AI attack patterns across regions.' },
]

const testimonials = [
  { quote: 'VeriTrust caught a cloned-voice wire fraud attempt our controls missed entirely. It paid for itself in one afternoon.', name: 'Priya Nair', role: 'Head of Fraud, NorthBank' },
  { quote: 'The cross-modal report is the first tool our analysts actually trust. The explainability is unmatched.', name: 'Marcus Feld', role: 'Director of Trust & Safety, Aegis Media' },
  { quote: 'We verify every KYC submission through the API now. Onboarding fraud dropped by double digits.', name: 'Lena Cho', role: 'VP Risk, FinCore' },
]

const faqs = [
  { q: 'What makes cross-modal verification different?', a: 'Instead of analyzing a single file in isolation, VeriTrust compares the identity signals across a face, a voice and a document together. Coordinated fakes that look convincing individually contradict each other across modalities — and that is exactly what we surface.' },
  { q: 'Which file formats are supported?', a: 'Images (PNG, JPEG), video (MP4, MOV), audio (MP3, WAV) and documents (PDF, DOCX). You can upload multiple formats in a single cross-modal scan.' },
  { q: 'How accurate is the authenticity score?', a: 'Each modality is scored by a dedicated ensemble model and combined into a unified score with a confidence level. Every verdict includes an AI explanation and the specific artifacts detected so your team can review the reasoning.' },
  { q: 'Is my data kept private?', a: 'Yes. All uploads are encrypted in transit and at rest, we are SOC 2 aligned, and you control data retention. Files can be auto-purged immediately after analysis.' },
  { q: 'Can I integrate VeriTrust into my product?', a: 'Absolutely. Our developer API exposes scan, verify, report and history endpoints with generated API keys, usage analytics and code examples in the developer portal.' },
]

export function WhyDeepfakes() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Why Deepfakes Matter"
          title="Synthetic media is now a board-level risk"
          description="AI-generated fraud is faster, cheaper and more convincing than ever. A single unverified file can trigger financial, legal and reputational damage."
        />
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {threats.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.08}>
            <div className="glass h-full rounded-2xl p-6 transition-colors hover:border-primary/40">
              <div className="grid size-11 place-items-center rounded-xl bg-destructive/12">
                <t.icon className="size-5 text-destructive" />
              </div>
              <h3 className="mt-4 font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 px-6 py-4 text-center text-sm">
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">Deepfake fraud attempts rose 34% </span>
            quarter over quarter across financial and government sectors.
          </span>
        </div>
      </Reveal>
    </section>
  )
}

export function HowItWorks() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.title} className="relative h-full rounded-2xl border border-border bg-card p-7">
          <span className="gradient-brand grid size-12 place-items-center rounded-2xl text-primary-foreground">
            <s.icon className="size-6" />
          </span>
          <span className="absolute right-6 top-6 font-mono text-sm text-muted-foreground/60">
            0{i + 1}
          </span>
          <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </div>
  )
}

export function SupportedMedia() {
  return (
    <section id="media" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Supported Media"
          title="Every modality, one platform"
          description="Verify the content types attackers exploit most — individually or together."
        />
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((m, i) => (
          <Reveal key={m.title} delay={i * 0.07}>
            <div className="glass group h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/12">
                  <m.icon className="size-5 text-primary" />
                </div>
                <span className="rounded-full bg-secondary/60 px-2.5 py-1 font-mono text-xs text-muted-foreground">
                  {m.formats}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function EnterpriseBenefits() {
  return (
    <section id="enterprise" className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Enterprise Benefits"
            title="Built for banks, governments and enterprises"
            description="The security, accuracy and scale trust teams demand — with the explainability auditors require."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-accent/12">
                  <b.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Testimonials"
          title="Risk teams trust VeriTrust"
        />
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <figure className="glass flex h-full flex-col rounded-2xl p-6">
              <Quote className="size-7 text-primary/50" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <Reveal>
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      </Reveal>
      <Reveal delay={0.1}>
        <Accordion openMultiple={false} className="mt-10 w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass mb-3 rounded-xl border px-5">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}

const featureList = [
  { label: 'Image Deepfake Detection', desc: 'GAN & diffusion artifact detection with noise fingerprinting' },
  { label: 'Video Deepfake Detection', desc: 'Face-swap, lip-sync and temporal flicker analysis' },
  { label: 'Audio Clone Detection', desc: 'Voice-clone detection via spectral and breathing-pattern analysis' },
  { label: 'Document Forgery Detection', desc: 'OCR verification, forgery indicators and metadata provenance checks' },
  { label: 'Cross-Modal Verification', desc: 'Correlate identity signals across files to expose coordinated fakes' },
  { label: 'AI Explainability', desc: 'Clear breakdown of every signal the model used to reach its verdict' },
  { label: 'Instant Authenticity Score', desc: 'Unified 0–100 score with risk badge and recommended action' },
  { label: 'Downloadable PDF Reports', desc: 'Share audit-ready reports with your team or clients' },
]

export function Features() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {featureList.map((f) => (
        <div key={f.label} className="glass flex items-start gap-4 rounded-2xl p-5 transition-colors hover:border-primary/30">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">{f.label}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PivotSection() {
  const [active, setActive] = useState<'how' | 'features'>('how')

  return (
    <section id="how" className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {/* Heading */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-border bg-secondary/40 px-5 py-2 text-base font-semibold text-accent">
              Explore
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              How it works &amp; what you get
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Everything from upload to verdict — and every capability built in.
            </p>
          </div>
        </Reveal>

        {/* Pill switcher */}
        <div className="mt-10 flex justify-center">
          <div className="flex rounded-full bg-secondary/60 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActive('how')}
              className={[
                'rounded-full px-8 py-3 text-base font-semibold transition-all duration-200',
                active === 'how'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => setActive('features')}
              className={[
                'rounded-full px-8 py-3 text-base font-semibold transition-all duration-200',
                active === 'features'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              Features
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">
          {active === 'how' ? <HowItWorks /> : <Features />}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center md:px-12">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-52 w-96 rounded-full bg-accent/20 blur-[120px]" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Stop trusting media at face value.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Start verifying every image, video, voice and document with a platform
            built for the deepfake era.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gradient-brand text-primary-foreground" render={<Link href="/signup" />}>
              Start Verification
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/dashboard" />}>
              Try the Demo
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
