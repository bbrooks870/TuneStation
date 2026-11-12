import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getPlaylist, trackOf } from "@/lib/api"
import { SITE_URL, clip, fmtCount, playlistPath, slugify } from "@/lib/site"
import { Crumbs, Hero, JsonLd } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"

export const revalidate = 21600
export const generateStaticParams = () => []

type P = { params: { slug: string; id: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
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
    openGraph: { type: "music.playlist", title: p.name, description, url, images: p.image ? [{ url: p.image, alt: p.name }] : undefined },
  }
}

export default async function PlaylistPage({ params }: P) {
  const p = await getPlaylist(params.id)
  if (!p) notFound()
  const url = playlistPath(p.name, p.id)
  if (params.slug !== slugify(p.name)) permanentRedirect(url)
  const tracks = p.songs.map(trackOf)

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
          {p.by} · {p.songs.length} songs{p.followers ? ` · ${fmtCount(p.followers)} followers` : ""}
        </p>
        <div className="mt-6 flex justify-center md:justify-start">
          <PlayAll tracks={tracks} label="Play playlist" />
        </div>
      </Hero>
      <section className="mt-6">
        <h2 className="sr-only">{p.name} – songs</h2>
        <TrackList tracks={tracks} />
      </section>
    </>
  )
}
