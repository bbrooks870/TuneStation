import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About TuneStation – Free Online Music Player",
  description: "TuneStation is a free web music player to stream and download Hindi, Punjabi, English and regional songs in 320kbps. No login, no app, works on any device.",
  alternates: { canonical: "/about" },
}

const FEATURES = [
  ["Completely free", "No subscription and no sign-up. Open the site and start listening."],
  ["320kbps quality", "Songs stream and download in high-quality 320kbps AAC."],
  ["Keeps playing while you browse", "The player stays at the bottom, so search and explore without stopping your music."],
  ["Download any song", "Every song page has a Download button to save the track for offline listening."],
  ["12 languages", "Hindi, Punjabi, English, Haryanvi, Bhojpuri, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada and Malayalam."],
  ["Always up to date", "Trending songs, new albums and charts refresh every hour."],
]

export default function About() {
  return (
    <article className="mx-auto max-w-4xl py-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">About TuneStation</h1>
      <p className="mt-4 text-lg leading-relaxed text-white/70">
        TuneStation is a free online music player for India. Stream the latest Bollywood, Punjabi and English hits, explore albums and artists,
        and download songs in 320kbps – right in your browser, on desktop or mobile.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-white/[.04] p-5">
            <h2 className="font-semibold text-white">{t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm leading-relaxed text-white/50">
        Music catalogue and streams are provided via JioSaavn. All songs, artwork and trademarks belong to their respective owners and labels.
        TuneStation does not host any audio files. Rights holders can request removal of any content – see our{" "}
        <Link href="/terms" className="text-accent hover:underline">terms of use</Link>.
      </p>
    </article>
  )
}
