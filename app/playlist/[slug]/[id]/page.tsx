import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getPlaylist, search, trackOf } from "@/lib/api"
import { SITE_URL, clip, fmtCount, playlistPath, slugify } from "@/lib/site"
import { Crumbs, Hero, JsonLd, MoodGrid, Section } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"

export const dynamic = "force-dynamic"

type P = { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata(props: P): Promise<Metadata> {
  const params = await props.params
  const p = await getPlaylist(params.id)
  if (!p) return { title: "Playlist not found", robots: { index: false } }
  const title = clip(`${p.name} – ${p.songs.length} Songs | Play & Download`, 70)
  const top = p.songs.slice(0, 3).map((s) => s.name).join(", ")
  const description = clip(`${p.name} playlist with ${p.songs.length} songs${top ? ` like ${top}` : ""}. Play the full playlist online free or download songs in 320kbps on TuneStation.`)
  const url = playlistPath(p.name, p.id)
  return {
    title: { absolute: `${title} | TuneStation` },
    description,
    alternates: { canonical: url },
    // JioSaavn sometimes lists playlists whose details come back empty – keep those out of the index
    ...(p.songs.length ? {} : { robots: { index: false, follow: true } }),
    openGraph: { type: "music.playlist", title: p.name, description, url, images: p.image ? [{ url: p.image, alt: p.name }] : undefined },
  }
}

export default async function PlaylistPage(props: P) {
  const params = await props.params
  const p = await getPlaylist(params.id)
  if (!p) notFound()
  const url = playlistPath(p.name, p.id)
  if (params.slug !== slugify(p.name)) permanentRedirect(url)
  const empty = !p.songs.length
  // ponytail: empty upstream playlist → fall back to a song search on its name
  const tracks = empty ? ((await search(p.name).catch(() => null))?.songs ?? []).map(trackOf) : p.songs.map(trackOf)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "MusicPlaylist",
              name: p.name,
              url: `${SITE_URL}${url}`,
              image: p.image,
              numTracks: p.songs.length,
              track: p.songs.map((s) => ({ "@type": "MusicRecording", name: s.name, url: `${SITE_URL}${s.href}`, byArtist: { "@type": "MusicGroup", name: s.artists } })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: p.name, item: `${SITE_URL}${url}` },
              ],
            },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, { name: p.name }]} />
      <Hero image={p.image} title={p.name} kicker="Playlist">
        <p className="mt-3 text-white/75">
          {p.by} · {empty ? "Similar songs" : `${p.songs.length} songs`}{p.followers ? ` · ${fmtCount(p.followers)} followers` : ""}
        </p>
        <div className="mt-6 flex justify-center md:justify-start">
          <PlayAll tracks={tracks} label="Play playlist" />
        </div>
      </Hero>
      <section className="mt-6">
        {empty ? (
          <p className="mb-4 rounded-xl bg-white/[.04] px-4 py-3 text-sm text-white/65">
            This playlist is currently empty on JioSaavn, so here are songs similar to “{p.name}”.
          </p>
        ) : null}
        <h2 className="sr-only">{p.name} – songs</h2>
        <TrackList tracks={tracks} />
      </section>
      {empty && (
        <Section title="Browse by mood">
          <MoodGrid scroll />
        </Section>
      )}
    </>
  )
}
