import { getModules, getPlaylist, trackOf } from "@/lib/api"
import { langName } from "@/lib/site"
import { Section, Shelf } from "./ui"
import { PlayAll, TrackList } from "./tracks"

/** Trending songs + album/chart/playlist shelves for one language. */
export async function ModulesView({ lang, headingLevel = "h2" }: { lang: string; headingLevel?: "h2" | "h3" }) {
  const m = await getModules(lang)
  if (!m) return <p className="mt-10 text-white/60">Couldn&apos;t load songs right now. Please refresh in a moment.</p>
  const L = langName(lang)
  const chart = m.charts[0] ? await getPlaylist(m.charts[0].id).catch(() => null) : null
  const top = (chart?.songs ?? []).slice(0, 15).map(trackOf)
  return (
    <>
      {m.trendingSongs.length > 0 && (
        <Section title={`Trending ${L} songs`} as={headingLevel}>
          <div className="mb-3">
            <PlayAll tracks={m.trendingSongs} label="Play all" />
          </div>
          <TrackList tracks={m.trendingSongs} />
        </Section>
      )}
      {top.length > 0 && (
        <Section title={`Top ${L} songs right now`} as={headingLevel} href={m.charts[0].href}>
          <div className="mb-3">
            <PlayAll tracks={top} label="Play top 15" />
          </div>
          <TrackList tracks={top} />
        </Section>
      )}
      <Section title={`New ${L} albums`} as={headingLevel}>
        <Shelf items={m.trendingAlbums} />
      </Section>
      <Section title="Top charts" as={headingLevel}>
        <Shelf items={m.charts} />
      </Section>
      <Section title={`Popular ${L} releases`} as={headingLevel}>
        <Shelf items={m.albums} />
      </Section>
      <Section title="Playlists for you" as={headingLevel}>
        <Shelf items={m.playlists} />
      </Section>
    </>
  )
}
