import type { Metadata } from "next"
import { search, trackOf } from "@/lib/api"
import { Grid, LangChips, MoodGrid, SearchBox, Section } from "@/components/ui"
import { PlayAll, TrackList } from "@/components/tracks"

export const metadata: Metadata = { title: "Search songs, artists & albums", robots: { index: false, follow: true }, alternates: { canonical: "/search" } }

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = (searchParams.q ?? "").trim().slice(0, 100)
  const r = q ? await search(q).catch(() => null) : null
  const tracks = r?.songs.map(trackOf) ?? []
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{q ? <>Results for “{q}”</> : "Search"}</h1>
      <div className="mt-5 max-w-2xl">
        <SearchBox defaultValue={q} autoFocus={!q} big />
      </div>
      {!q && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-white/55">Or browse by language</p>
          <LangChips />
          <p className="mb-3 mt-8 text-sm text-white/55">Or pick a mood</p>
          <MoodGrid />
        </div>
      )}
      {q && !r && <p className="mt-8 text-white/60">Search is busy right now – please try again in a moment.</p>}
      {r && (
        <>
          {r.artists.length > 0 && (
            <Section title="Artists">
              <Grid items={r.artists.slice(0, 6)} />
            </Section>
          )}
          <Section title="Songs">
            {tracks.length > 0 && (
              <div className="mb-3">
                <PlayAll tracks={tracks} label="Play all" />
              </div>
            )}
            <TrackList tracks={tracks} />
          </Section>
          {r.albums.length > 0 && (
            <Section title="Albums">
              <Grid items={r.albums} />
            </Section>
          )}
          {r.playlists.length > 0 && (
            <Section title="Playlists">
              <Grid items={r.playlists} />
            </Section>
          )}
        </>
      )}
    </>
  )
}
