import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getArtist, trackOf } from "@/lib/api"
import { SITE_URL, artistPath, clip, fmtCount, langName, slugify } from "@/lib/site"
import { Crumbs, Grid, Hero, JsonLd, Section } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"

export const dynamic = "force-dynamic"

type P = { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata(props: P): Promise<Metadata> {
  const params = await props.params
  const a = await getArtist(params.id)
  if (!a) return { title: "Artist not found", robots: { index: false } }
  const year = new Date().getFullYear()
  const title = `${a.name} Songs ${year} – Listen & Download All Hit Songs`
  const top = a.songs.slice(0, 3).map((s) => s.name).join(", ")
  const description = clip(
    `Play ${a.name}'s latest and best songs${top ? ` like ${top}` : ""}. ${a.totalSongs ? `${a.totalSongs.toLocaleString("en-IN")} songs` : "Top songs"} and albums – listen online free or download in 320kbps on TuneStation.`,
  )
  const url = artistPath(a.name, a.id)
  return {
    title: { absolute: `${clip(title, 70)} | TuneStation` },
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: `${a.name} – songs & albums`, description, url, images: a.image ? [{ url: a.image, width: 500, height: 500, alt: a.name }] : undefined },
  }
}

export default async function ArtistPage(props: P) {
  const params = await props.params
  const a = await getArtist(params.id)
  if (!a) notFound()
  const url = artistPath(a.name, a.id)
  if (params.slug !== slugify(a.name)) permanentRedirect(url)
  const tracks = a.songs.map(trackOf)
  const paras = a.bio.split("\n\n").filter(Boolean).slice(0, 3)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "MusicGroup",
              name: a.name,
              url: `${SITE_URL}${url}`,
              image: a.image,
              ...(paras[0] ? { description: clip(paras[0], 300) } : {}),
              ...(a.wiki ? { sameAs: [a.wiki] } : {}),
              track: a.songs.slice(0, 10).map((s) => ({ "@type": "MusicRecording", name: s.name, url: `${SITE_URL}${s.href}` })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: a.name, item: `${SITE_URL}${url}` },
              ],
            },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, { name: a.name }]} />
      <Hero image={a.image} title={a.name} kicker={a.verified ? "✓ Verified artist" : "Artist"} round>
        <p className="mt-3 text-white/75">
          {[a.role && a.role.replace(/^\w/, (c) => c.toUpperCase()), a.language && langName(a.language), a.followers ? `${fmtCount(a.followers)} followers` : ""]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-6 flex justify-center md:justify-start">
          <PlayAll tracks={tracks} label="Play top songs" />
        </div>
      </Hero>

      <Section title={`Popular ${a.name} songs`}>
        <TrackList tracks={tracks} />
      </Section>

      {a.albums.length > 0 && (
        <Section title={`${a.name} albums`}>
          <Grid items={a.albums} />
        </Section>
      )}

      {paras.length > 0 && (
        <Section title={`About ${a.name}`}>
          <div className="max-w-3xl space-y-3 leading-relaxed text-white/65">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {a.wiki && (
              <p>
                <a href={a.wiki} target="_blank" rel="noopener nofollow" className="text-accent hover:underline">
                  Read more on Wikipedia
                </a>
              </p>
            )}
          </div>
        </Section>
      )}
    </>
  )
}
