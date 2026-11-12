import type { Metadata } from "next"
import { JsonLd } from "@/components/ui"
import { SITE_URL } from "@/lib/site"

const EMAIL = "support@watchtvs.live"

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact TuneStation for support, feedback, song requests or copyright removal requests. Email us at ${EMAIL} – we usually reply within 48 hours.`,
  alternates: { canonical: "/contact" },
}

const TOPICS = [
  ["Help & feedback", "A song won't play or download, something looks broken, or you have an idea to make TuneStation better."],
  ["Copyright & removal requests", "If you own a song, album or artwork shown on TuneStation and want it removed, email us with the page URL and proof of ownership. We act on valid requests quickly."],
  ["Business & partnerships", "Advertising, collaborations or anything else – drop us a line."],
]

export default function Contact() {
  return (
    <article className="mx-auto max-w-3xl py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${SITE_URL}/contact`,
          name: "Contact TuneStation",
          mainEntity: { "@type": "Organization", name: "TuneStation", url: `${SITE_URL}/`, email: EMAIL, contactPoint: { "@type": "ContactPoint", email: EMAIL, contactType: "customer support" } },
        }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Contact us</h1>
      <p className="mt-4 text-lg leading-relaxed text-white/70">Questions, problems or requests? Email us and we&apos;ll get back to you, usually within 48 hours.</p>
      <a
        href={`mailto:${EMAIL}`}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-7 font-semibold text-night-900 shadow-lg shadow-accent/20 transition hover:bg-accent-2"
      >
        {EMAIL}
      </a>
      <div className="mt-10 grid gap-4">
        {TOPICS.map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-white/[.04] p-5">
            <h2 className="font-semibold text-white">{t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{d}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
