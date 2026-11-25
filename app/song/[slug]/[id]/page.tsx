import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { getAlbum, getArtistSongs, getSong, trackOf, type Song } from "@/lib/api"
import { SITE_URL, albumPath, artistPath, clip, fmtCount, fmtTime, langName, slugify } from "@/lib/site"
import { ArtistLinks, Crumbs, Hero, JsonLd, Section } from "@/components/ui"
import { DownloadButton, FavButton, PlayAll, TrackList } from "@/components/tracks"

export const dynamic = "force-dynamic"

type P = { params: { slug: string; id: string } }

const by = (s: Song) => s.primary.map((a) => a.name).join(", ") || s.artists
const isoDur = (sec: number) => `PT${Math.floor(sec / 60)}M${sec % 60}S`

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = await getSong(params.id)
  if (!s) return { title: "Song not found", robots: { index: false } }
  const lang = s.language ? langName(s.language) : ""
  const title = clip(`${s.name} – ${s.primary[0]?.name ?? s.artists} | Listen & Download MP3 320kbps`, 70)
  const description = clip(
    `Listen to ${s.name} by ${by(s)}${s.album && s.album !== s.name ? ` from ${s.album}` : ""}${s.year ? ` (${s.year})` : ""}. Play the ${lang} song online free or download it in 320kbps on TuneStation.`,
  )
  const url = s.href
  return {
    title: { absolute: `${title} | TuneStation` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "music.song", title: `${s.name} – ${by(s)}`, description, url, images: [{ url: s.image, width: 500, height: 500, alt: s.name }] },
    twitter: { card: "summary_large_image", title: `${s.name} – ${by(s)}`, description, images: [s.image] },
  }
}

export default async function SongPage({ params }: P) {
  const s = await getSong(params.id)
  if (!s) notFound()
  if (params.slug !== slugify(s.name)) permanentRedirect(s.href)

  const [album, artistSongs] = await Promise.all([
    s.albumId ? getAlbum(s.albumId).catch(() => null) : null,
    s.primary[0]?.id ? getArtistSongs(s.primary[0].id) : [],
  ])
  const albumMore = (album?.songs ?? []).filter((x) => x.id !== s.id).map(trackOf)
  const artistMore = artistSongs.filter((x) => x.id !== s.id && !albumMore.some((a) => a.id === x.id)).slice(0, 10).map(trackOf)
  const track = trackOf(s)
  const lang = s.language ? langName(s.language) : ""
  const albumHref = s.albumId ? albumPath(s.album || s.name, s.albumId) : ""

  const rows: [string, React.ReactNode][] = [
    ["Song", s.name],
    ["Singers", <ArtistLinks key="a" list={s.primary} />],
    ...(s.featured.length ? [["Featuring", <ArtistLinks key="f" list={s.featured} />] as [string, React.ReactNode]] : []),
    ...(s.album ? [["Album", albumHref ? <Link key="al" href={albumHref} className="text-accent hover:underline">{s.album}</Link> : s.album] as [string, React.ReactNode]] : []),
    ...(lang ? [["Language", <Link key="l" href={`/songs/${s.language}`} className="text-accent hover:underline">{lang}</Link>] as [string, React.ReactNode]] : []),
    ...(s.releaseDate || s.year ? [["Released", s.releaseDate || s.year] as [string, React.ReactNode]] : []),
    ...(s.duration ? [["Duration", fmtTime(s.duration)] as [string, React.ReactNode]] : []),
    ...(s.label ? [["Label", s.label] as [string, React.ReactNode]] : []),
    ...(s.playCount ? [["Plays", fmtCount(s.playCount)] as [string, React.ReactNode]] : []),
    ["Quality", "320kbps (AAC .m4a)"],
  ]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "MusicRecording",
              "@id": `${SITE_URL}${s.href}#song`,
              name: s.name,
              url: `${SITE_URL}${s.href}`,
              image: s.image,
              ...(s.duration ? { duration: isoDur(s.duration) } : {}),
              ...(s.releaseDate ? { datePublished: s.releaseDate } : {}),
              ...(s.language ? { inLanguage: s.language } : {}),
              byArtist: s.primary.map((a) => ({ "@type": "MusicGroup", name: a.name, ...(a.id ? { url: `${SITE_URL}${artistPath(a.name, a.id)}` } : {}) })),
              ...(s.album ? { inAlbum: { "@type": "MusicAlbum", name: s.album, ...(albumHref ? { url: `${SITE_URL}${albumHref}` } : {}) } } : {}),
              ...(s.label ? { recordLabel: { "@type": "Organization", name: s.label } } : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                ...(lang ? [{ "@type": "ListItem", position: 2, name: `${lang} songs`, item: `${SITE_URL}/songs/${s.language}` }] : []),
                { "@type": "ListItem", position: lang ? 3 : 2, name: s.name, item: `${SITE_URL}${s.href}` },
              ],
            },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, ...(lang ? [{ name: `${lang} songs`, href: `/songs/${s.language}` }] : []), { name: s.name }]} />

      <Hero image={s.image} title={s.name} kicker={["Song", lang, s.year].filter(Boolean).join(" · ")}>
        <p className="mt-3 text-white/75">
          <ArtistLinks list={s.primary} />
          {s.album && s.album !== s.name && albumHref && (
            <>
              {" · "}
              <Link href={albumHref} className="hover:underline">
                {s.album}
              </Link>
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
          <PlayAll tracks={[track, ...albumMore, ...artistMore]} />
          <FavButton track={track} big />
          <DownloadButton track={track} big />
        </div>
      </Hero>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">About {s.name}</h2>
          <p className="mt-3 leading-relaxed text-white/70">
            <strong className="text-white">{s.name}</strong> is a {lang ? `${lang} ` : ""}song by {by(s)}
            {s.featured.length ? ` featuring ${s.featured.map((a) => a.name).join(", ")}` : ""}
            {s.album && s.album !== s.name ? `, from the album ${s.album}` : ""}
            {s.releaseDate || s.year ? `, released ${s.releaseDate ? `on ${s.releaseDate}` : `in ${s.year}`}` : ""}
            {s.label ? ` under ${s.label}` : ""}. {s.duration ? `The track runs ${fmtTime(s.duration)}` : "You can stream it here"}
            {s.playCount ? ` and has been played over ${fmtCount(s.playCount)} times` : ""}. Press Play to listen to {s.name} online for free, or
            tap Download to save the MP3/M4A in 320kbps.
          </p>
          {s.copyright && <p className="mt-3 text-xs text-white/40">{s.copyright}</p>}
        </div>
        <dl className="h-fit rounded-2xl bg-white/[.04] p-5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-white/5 py-2 last:border-0">
              <dt className="w-24 shrink-0 text-white/45">{k}</dt>
              <dd className="min-w-0 text-white/85">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {albumMore.length > 0 && (
        <Section title={`More songs from ${s.album}`} href={albumHref || undefined}>
          <TrackList tracks={albumMore} showAlbum={false} />
        </Section>
      )}
      {artistMore.length > 0 && s.primary[0] && (
        <Section title={`More by ${s.primary[0].name}`} href={s.primary[0].id ? artistPath(s.primary[0].name, s.primary[0].id) : undefined}>
          <TrackList tracks={artistMore} />
        </Section>
      )}
    </>
  )
}
