import type { MetadataRoute } from "next"
import { getModules, getPlaylist } from "@/lib/api"
import { LANGS, MOODS, SITE_URL, moodPath } from "@/lib/site"

export const revalidate = 86400

// ponytail: seeded from each language's home modules + the songs inside top charts; song/album/artist links on those pages let Google crawl the rest.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const urls = new Map<string, { p: number; f: "hourly" | "daily" | "weekly" | "monthly" }>()
  const add = (path: string, p: number, f: "hourly" | "daily" | "weekly" | "monthly") => {
    if (!urls.has(path)) urls.set(path, { p, f })
  }
  add("/", 1, "hourly")
  LANGS.forEach((l) => add(`/songs/${l.key}`, 0.9, "hourly"))
  add("/mood", 0.8, "weekly")
  MOODS.forEach((m) => add(moodPath(m.key), 0.8, "daily"))
  add("/about", 0.3, "monthly")
  add("/contact", 0.3, "monthly")
  add("/terms", 0.2, "monthly")

  const mods = await Promise.all(LANGS.map((l) => getModules(l.key)))
  const charts: string[] = []
  for (const m of mods) {
    if (!m) continue
    m.trendingSongs.forEach((t) => add(t.href, 0.7, "weekly"))
    ;[...m.trendingAlbums, ...m.albums, ...m.charts, ...m.playlists].forEach((c) => add(c.href, c.kind === "song" ? 0.7 : 0.6, "daily"))
    charts.push(...m.charts.slice(0, 3).map((c) => c.id))
  }
  const lists = await Promise.all(charts.slice(0, 18).map((id) => getPlaylist(id).catch(() => null)))
  for (const p of lists) p?.songs.forEach((s) => add(s.href, 0.6, "weekly"))

  return [...urls].map(([path, v]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: v.f, priority: v.p }))
}
