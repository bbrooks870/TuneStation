import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPlaylist, searchPlaylists, trackOf } from "@/lib/api"
import { MOODS, SITE_URL, moodPath } from "@/lib/site"
import { Crumbs, Grid, JsonLd, MoodGrid, Section } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"
import { SleepTimer } from "@/components/player"

export const dynamic = "force-dynamic"

type P = { params: { key: string } }
const find = (k: string) => MOODS.find((m) => m.key === k)

export function generateMetadata({ params }: P): Metadata {
  const m = find(params.key)
  if (!m) return { title: "Not found", robots: { index: false } }
  const title = `${m.name} Music & Songs – Listen Free Online`
  return { title, description: `${m.blurb} Stream ${m.name.toLowerCase()} playlists free on TuneStation – no login, no app.`, alternates: { canonical: moodPath(m.key) }, openGraph: { title, url: moodPath(m.key) } }
}

export default async function MoodPage({ params }: P) {
  const m = find(params.key)
  if (!m) notFound()
  const lists = await searchPlaylists(m.q).catch(() => [])
  // ponytail: "Play now" = songs from the top 4 playlists; the grid links the rest.
  const top = await Promise.all(lists.slice(0, 4).map((c) => getPlaylist(c.id).catch(() => null)))
  const seen = new Set<string>()
  const tracks = top.flatMap((p) => p?.songs ?? []).filter((s) => !seen.has(s.id) && !!seen.add(s.id)).slice(0, 30).map(trackOf)
  const calm = ["meditation", "sleep", "focus", "chill"].includes(m.key)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Moods", item: `${SITE_URL}/mood` },
            { "@type": "ListItem", position: 3, name: m.name, item: `${SITE_URL}${moodPath(m.key)}` },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, { name: "Moods", href: "/mood" }, { name: m.name }]} />
      <section className={`relative isolate -mx-4 overflow-hidden bg-gradient-to-br ${m.tint} to-transparent px-4 py-8 md:mx-0 md:rounded-3xl md:p-10`}>
        <p className="text-5xl" aria-hidden="true">{m.emoji}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">{m.name} music</h1>
        <p className="mt-3 max-w-2xl text-white/75">{m.blurb}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PlayAll tracks={tracks} label={`Play ${m.name.toLowerCase()}`} />
          {calm && <SleepTimer />}
        </div>
      </section>

      {tracks.length > 0 && (
        <Section title={`${m.name} songs`}>
          <TrackList tracks={tracks} />
        </Section>
      )}
      {lists.length > 0 ? (
        <Section title={`${m.name} playlists`}>
          <Grid items={lists} />
        </Section>
      ) : (
        <p className="mt-10 text-white/60">Couldn&apos;t load playlists right now. Please refresh in a moment.</p>
      )}
      <Section title="More moods">
        <MoodGrid active={m.key} scroll />
      </Section>
    </>
  )
}
