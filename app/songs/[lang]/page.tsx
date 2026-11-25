import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ModulesView } from "@/components/modules-view"
import { Crumbs, JsonLd, LangChips } from "@/components/ui"
import { LANGS, SITE_URL, langName } from "@/lib/site"

export const dynamic = "force-dynamic"


const year = () => new Date().getFullYear()

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const L = langName(params.lang)
  const title = `Latest ${L} Songs ${year()} – Listen & Download Free`
  const description = `Play and download the latest ${L} songs of ${year()}: trending hits, new ${L} albums, top charts and playlists in 320kbps on TuneStation. Free, no login.`
  return {
    title,
    description,
    alternates: { canonical: `/songs/${params.lang}` },
    openGraph: { title, description, url: `/songs/${params.lang}` },
  }
}

export default function LangPage({ params }: { params: { lang: string } }) {
  if (!LANGS.some((l) => l.key === params.lang)) notFound()
  const L = langName(params.lang)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: `${L} songs`, item: `${SITE_URL}/songs/${params.lang}` },
          ],
        }}
      />
      <Crumbs items={[{ name: "Home", href: "/" }, { name: `${L} songs` }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
        Latest {L} songs {year()}
      </h1>
      <p className="mt-3 max-w-3xl text-white/65">
        Trending {L} songs, new {L} albums and the top {L} charts – updated every hour. Tap any song to play it instantly, or open it to
        download in 320kbps.
      </p>
      <div className="mt-5">
        <LangChips active={params.lang} />
      </div>
      <ModulesView lang={params.lang} />
    </>
  )
}
