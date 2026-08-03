import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { Hero } from '@/components/landing/hero'
import { PivotSection } from '@/components/landing/pivot-section'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <Hero />
        <PivotSection />
      </main>
      <SiteFooter />
    </div>
  )
}
