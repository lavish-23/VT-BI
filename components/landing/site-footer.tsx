import Link from 'next/link'
import { Logo } from '@/components/logo'

const cols = [
  {
    title: 'Product',
    links: ['Overview', 'Cross-Modal Detection', 'Enterprise', 'Pricing', 'Developer API'],
  },
  {
    title: 'Solutions',
    links: ['Banking & KYC', 'Government', 'Media & News', 'Insurance', 'Elections'],
  },
  {
    title: 'Company',
    links: ['About', 'Security', 'Careers', 'Blog', 'Contact'],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The Digital Trust Platform for verifying the authenticity of any
              media before you trust or publish it.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 VeriTrust AI, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">SOC 2</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
