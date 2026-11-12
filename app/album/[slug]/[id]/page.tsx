import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { getAlbum, trackOf } from "@/lib/api"
import { SITE_URL, albumPath, artistPath, clip, fmtTime, langName, slugify } from "@/lib/site"
import { ArtistLinks, Crumbs, Hero, JsonLd } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"

export const revalidate = 86400
export const generateStaticParams = () => []

type P = { params: { slug: string; id: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = await getAlbum(params.id)
  if (!a) return { title: "Album not found", robots: { index: false } }
  const who = a.artists.map((x) => x.name).slice(0, 3).join(", ")
  const lang = a.language ? langName(a.language) : ""
  const title = clip(`${a.name}${a.year ? ` (${a.year})` : ""} – All Songs | Listen & Download`, 70)
  const top = a.songs.slice(0, 3).map((s) => s.name).join(", ")
  const description = clip(
    `${a.name} ${lang} album${who ? ` by ${who}` : ""}: ${a.songs.length} song${a.songs.length === 1 ? "" : "s"}${top ? ` including ${top}` : ""}. Listen online free or download every song in 320kbps on TuneStation.`,
  )
  const url = albumPath(a.name, a.id)
  return {
    title: { absolute: `${title} | TuneStation` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "music.album", title: `${a.name} – ${who}`, description, url, images: [{ url: a.image, width: 500, height: 500, alt: a.name }] },
  }
}

export default async function AlbumPage({ params }: P) {
  const a = await getAlbum(params.id)
  if (!a) notFound()
  const url = albumPath(a.name, a.id)
  if (params.slug !== slugify(a.name)) permanentRedirect(url)
  const tracks = a.songs.map(trackOf)
  const total = a.songs.reduce((n, s) => n + (s.duration || 0), 0)
  const lang = a.language ? langName(a.language) : ""

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "MusicAlbum",
              name: a.name,
              url: `${SITE_URL}${url}`,
              image: a.image,
              ...(a.releaseDate ? { datePublished: a.releaseDate.replace(/\//g, "-") } : {}),
              numTracks: a.songs.length,
              byArtist: a.artists.map((x) => ({ "@type": "MusicGroup", name: x.name, ...(x.id ? { url: `${SITE_URL}${artistPath(x.name, x.id)}` } : {}) })),
              track: {
                "@type": "ItemList",
                numberOfItems: a.songs.length,
                itemListElement: a.songs.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "MusicRecording", name: s.name, url: `${SITE_URL}${s.href}` } })),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                ...(lang ? [{ "@type": "ListItem", position: 2, name: `${lang} songs`, item: `${SITE_URL}/songs/${a.language}` }] : []),
                { "@type": "ListItem", position: lang ? 3 : 2, name: a.name, item: `${SITE_URL}${url}` },
              ],
            },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, ...(lang ? [{ name: `${lang} songs`, href: `/songs/${a.language}` }] : []), { name: a.name }]} />
      <Hero image={a.image} title={a.name} kicker={["Album", lang, a.year].filter(Boolean).join(" · ")}>
        <p className="mt-3 text-white/75">
          <ArtistLinks list={a.artists.slice(0, 4)} />
          {" · "}
          {a.songs.length} song{a.songs.length === 1 ? "" : "s"}
          {total ? `, ${Math.round(total / 60)} min` : ""}
        </p>
        <div className="mt-6 flex justify-center md:justify-start">
          <PlayAll tracks={tracks} label="Play album" />
        </div>
      </Hero>

      <section className="mt-6">
        <h2 className="sr-only">{a.name} songs list</h2>
        <TrackList tracks={tracks} showAlbum={false} />
      </section>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/55">
        {a.name} is a {lang ? `${lang} ` : ""}album{a.artists.length ? ` by ${a.artists.map((x) => x.name).slice(0, 4).join(", ")}` : ""}
        {a.releaseDate ? `, released on ${a.releaseDate}` : a.year ? `, released in ${a.year}` : ""}
        {a.label ? ` (${a.label})` : ""}, with {a.songs.length} track{a.songs.length === 1 ? "" : "s"}
        {total ? ` and a total running time of ${fmtTime(total)}` : ""}. Tap any song to play it, or open it to download in 320kbps.
        {a.songs.length > 0 && (
          <>
            {" "}Songs:{" "}
            {a.songs.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ", "}
                <Link href={s.href} className="text-white/75 hover:underline">
                  {s.name}
                </Link>
              </span>
            ))}
            .
          </>
        )}
      </p>
    </>
  )
}
