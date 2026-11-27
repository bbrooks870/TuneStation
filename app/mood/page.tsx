import type { Metadata } from "next"
import { Crumbs, MoodGrid } from "@/components/ui"

export const metadata: Metadata = {
  title: "Music for Every Mood – Meditation, Sleep, Workout & More",
  description: "Free music for every mood and moment: meditation, sleep, focus, workout, romantic, party, devotional, road trip and more. Play instantly on TuneStation.",
  alternates: { canonical: "/mood" },
}

export default function MoodsPage() {
  return (
    <>
      <Crumbs items={[{ name: "Home", href: "/" }, { name: "Moods" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Music for every mood</h1>
      <p className="mt-3 max-w-2xl text-white/65">Pick what you&apos;re doing or how you feel – we&apos;ll line up the right playlists.</p>
      <div className="mt-8">
        <MoodGrid />
      </div>
    </>
  )
}
