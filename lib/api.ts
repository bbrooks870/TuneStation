import { albumPath, artistPath, playlistPath, songPath } from "./site"
import type { Card, Track } from "./types"

// Local self-hosted JioSaavn API container running on chunks:3008
const BASE = process.env.SAAVN_API_URL || "http://127.0.0.1:3008/api"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"

/**
 * null = genuinely not found (API 404/400 or empty shape → page 404).
 * Throws on outages/timeouts/5xx so pages answer 500 instead of telling Google the song is gone.
 */
async function api<T = any>(path: string, revalidate = 3600): Promise<T | null> {
  const r = await fetch(BASE + path, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  })
  if (r.status === 404 || r.status === 400) return null
  if (!r.ok) throw new Error(`saavn api ${r.status} ${path}`)
  const j = await r.json()
  return (j?.data ?? null) as T
}

/* ---------- normalisers (the API returns different shapes per endpoint) ---------- */

export function decode(s: unknown): string {
  if (typeof s !== "string") return ""
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

function img(arr: any, q: "500" | "150" = "500"): string {
  if (!Array.isArray(arr) || !arr.length) return typeof arr === "string" ? arr : ""
  const hit = arr.find((i: any) => String(i?.quality).startsWith(q)) ?? arr[arr.length - 1]
  return String(hit?.link ?? hit?.url ?? "").replace(/^http:/, "https:")
}

export type ArtistRef = { id: string; name: string }

function artists(names: any, ids?: any): ArtistRef[] {
  if (Array.isArray(names)) return names.filter((a) => a?.name).map((a) => ({ id: String(a.id), name: decode(a.name) }))
  if (typeof names !== "string") return []
  const n = names.split(",").map((s) => decode(s)).filter(Boolean)
  const i = typeof ids === "string" ? ids.split(",").map((s) => s.trim()) : []
  return n.map((name, k) => ({ id: i[k] || "", name }))
}

const names = (a: ArtistRef[]) => a.map((x) => x.name).join(", ")

export type Song = Track & {
  albumId: string
  year: string
  releaseDate: string
  label: string
  language: string
  playCount: number
  copyright: string
  primary: ArtistRef[]
  featured: ArtistRef[]
  explicit: boolean
}

function toSong(r: any): Song {
  const primary = artists(r.primaryArtists, r.primaryArtistsId)
  const featured = artists(r.featuredArtists, r.featuredArtistsId)
  const name = decode(r.name ?? r.title)
  const dl = Array.isArray(r.downloadUrl) ? r.downloadUrl : []
  const best = dl.find((d: any) => d.quality === "320kbps") ?? dl[dl.length - 1]
  const audioUrl = best?.url ?? best?.link ?? ""
  return {
    id: String(r.id),
    name,
    artists: names(primary) || decode(r.label),
    image: img(r.image),
    thumb: img(r.image, "150"),
    href: songPath(name, String(r.id)),
    src: audioUrl ? String(audioUrl).replace(/^http:/, "https:") : undefined,
    duration: Number(r.duration) || 0,
    album: decode(r.album?.name ?? r.album),
    albumId: String(r.album?.id ?? ""),
    year: String(r.year ?? ""),
    releaseDate: r.releaseDate && r.releaseDate !== "None" ? String(r.releaseDate) : "",
    label: decode(r.label),
    language: String(r.language ?? ""),
    playCount: Number(r.playCount) || 0,
    copyright: decode(r.copyright),
    primary,
    featured,
    explicit: String(r.explicitContent) === "1",
  }
}

function toCard(r: any): Card | null {
  if (!r?.id) return null
  const type = r.type === "song" ? "song" : r.type === "playlist" ? "playlist" : r.type === "artist" ? "artist" : "album"
  const name = decode(r.name ?? r.title)
  const by = artists(r.primaryArtists ?? r.artist)
  const subtitle =
    type === "playlist"
      ? decode(r.subtitle || (r.songCount ? `${r.songCount} songs` : "Playlist"))
      : type === "artist"
        ? "Artist"
        : names(by) || decode(r.description) || (r.year ? String(r.year) : "")
  const id = String(r.id)
  const href =
    type === "song" ? songPath(name, id) : type === "playlist" ? playlistPath(name, id) : type === "artist" ? artistPath(name, id) : albumPath(name, id)
  return { kind: type, id, name, subtitle, image: img(r.image), href }
}

const cards = (a: any) => (Array.isArray(a) ? a.map(toCard).filter(Boolean) as Card[] : [])

/** Module songs carry no stream URL; the player resolves it on play. */
export function toTrack(r: any): Track {
  const s = toSong(r)
  return { id: s.id, name: s.name, artists: s.artists, image: s.image, thumb: s.thumb, href: s.href, src: s.src, duration: s.duration, album: s.album }
}

export const trackOf = (s: Song): Track => ({ id: s.id, name: s.name, artists: s.artists, image: s.image, thumb: s.thumb, href: s.href, src: s.src, duration: s.duration, album: s.album })

/* ---------- endpoints ---------- */

export async function getModules(lang: string) {
  const d = await api(`/modules?language=${lang}`).catch(() => null)
  if (!d) return null
  return {
    trendingSongs: (d.trending?.songs ?? []).map(toTrack) as Track[],
    trendingAlbums: cards(d.trending?.albums),
    albums: cards(d.albums),
    charts: cards(d.charts),
    playlists: cards(d.playlists),
  }
}

export async function getSong(id: string) {
  const d = await api<any[]>(`/songs/${encodeURIComponent(id)}`, 86400)
  return d?.[0] ? toSong(d[0]) : null
}

export async function getAlbum(id: string) {
  const d = await api(`/albums?id=${encodeURIComponent(id)}`, 86400)
  if (!d?.id) return null
  const songs = (d.songs ?? []).map(toSong) as Song[]
  const by = artists(d.primaryArtists, d.primaryArtistsId)
  return {
    id: String(d.id),
    name: decode(d.name),
    year: String(d.year ?? ""),
    releaseDate: d.releaseDate ? String(d.releaseDate) : "",
    image: img(d.image),
    artists: by.length ? by : songs[0]?.primary ?? [],
    language: songs[0]?.language ?? "",
    label: songs[0]?.label ?? "",
    songs,
  }
}

export async function getPlaylist(id: string) {
  const d = await api(`/playlists?id=${encodeURIComponent(id)}&limit=100`, 21600)
  if (!d?.id || !d.name) return null
  return {
    id: String(d.id),
    name: decode(d.name),
    image: img(d.image),
    followers: Number(d.followerCount) || 0,
    by: decode([d.firstname, d.lastname].filter(Boolean).join(" ")) || "JioSaavn",
    songs: (d.songs ?? []).map(toSong) as Song[],
  }
}

export async function getArtist(id: string) {
  const [d, s, a] = await Promise.all([
    api(`/artists?id=${encodeURIComponent(id)}`, 86400),
    api(`/artists/${encodeURIComponent(id)}/songs?page=1`, 86400).catch(() => null),
    api(`/artists/${encodeURIComponent(id)}/albums?page=1`, 86400).catch(() => null),
  ])
  if (!d?.id || !d.name) return null
  const bio: string = Array.isArray(d.bio) ? d.bio.map((b: any) => decode(b?.text)).filter(Boolean).join("\n\n") : ""
  return {
    id: String(d.id),
    name: decode(d.name),
    image: img(d.image),
    followers: Number(d.followerCount) || 0,
    verified: !!d.isVerified,
    language: String(d.dominantLanguage ?? ""),
    role: decode(d.dominantType),
    bio,
    wiki: typeof d.wiki === "string" ? d.wiki : "",
    songs: ((s?.results ?? []) as any[]).map(toSong),
    totalSongs: Number(s?.total) || 0,
    albums: cards(a?.results),
    totalAlbums: Number(a?.total) || 0,
  }
}

export async function getArtistSongs(id: string) {
  const s = await api(`/artists/${encodeURIComponent(id)}/songs?page=1`, 86400).catch(() => null)
  return ((s?.results ?? []) as any[]).map(toSong)
}

export async function search(q: string) {
  const qs = encodeURIComponent(q)
  const [songs, all] = await Promise.all([
    api(`/search/songs?query=${qs}&page=1&limit=20`, 600).catch(() => null),
    api(`/search?query=${qs}`, 600).catch(() => null),
  ])
  return {
    songs: ((songs?.results ?? []) as any[]).map(toSong),
    albums: cards(all?.albums?.results),
    artists: cards(all?.artists?.results),
    playlists: cards(all?.playlists?.results),
  }
}

/** Merge several playlist searches (deduped, interleaved) – powers the mood pages. */
export async function searchPlaylists(queries: readonly string[]) {
  const res = await Promise.all(queries.map((q) => api(`/search/playlists?query=${encodeURIComponent(q)}&limit=20`, 86400).catch(() => null)))
  // interleave (1st of each query, then 2nd…) so the top picks mix every query
  const lists = res.map((r) => cards(r?.results))
  const seen = new Set<string>()
  const out: Card[] = []
  for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i++)
    for (const l of lists) if (l[i] && !seen.has(l[i].id) && seen.add(l[i].id)) out.push(l[i])
  return out
}

