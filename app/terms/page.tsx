import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for TuneStation, the free online music player: personal use only, no redistribution, and how rights holders can request removal.",
  alternates: { canonical: "/terms" },
}

const TERMS: [string, React.ReactNode][] = [
  ["Personal use only", "TuneStation is provided for personal, non-commercial listening. You may stream or download music for your own personal use."],
  ["Music data", "TuneStation uses an unofficial JioSaavn API (based on Sumit Kolhe's open-source jiosaavn-api, MIT licensed) to fetch song information and streams. TuneStation does not host any audio files."],
  ["No sharing or piracy", "You agree not to share, sell or redistribute music downloaded from TuneStation, and not to use TuneStation for piracy or any other illegal activity."],
  ["Ownership", "All songs, albums, playlists and artwork belong to JioSaavn and the respective labels and artists. We do not intend to infringe any copyright, trademark or other intellectual property right."],
  [
    "For JioSaavn and rights holders",
    <>
      If you own content shown on TuneStation and want it removed, raise an issue at the{" "}
      <a href="https://github.com/codyandersan/TuneStation" target="_blank" rel="noopener nofollow" className="text-accent hover:underline">TuneStation GitHub repository</a>{" "}
      and we will act on it as quickly as possible.
    </>,
  ],
  ["Changes", "We may update these terms at any time. Continuing to use TuneStation after a change means you accept the revised terms."],
]

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl py-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Terms of use</h1>
      <p className="mt-4 leading-relaxed text-white/70">By accessing or using TuneStation you agree to these terms. If you do not agree, please do not use TuneStation.</p>
      <dl className="mt-8 space-y-6">
        {TERMS.map(([t, d]) => (
          <div key={t}>
            <dt className="font-semibold text-white">{t}</dt>
            <dd className="mt-1 leading-relaxed text-white/65">{d}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
