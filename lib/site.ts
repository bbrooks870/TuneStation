export const SITE_URL = "https://songs.watchtvs.live"
export const SITE_NAME = "TuneStation"

export const LANGS = [
  { key: "hindi", name: "Hindi" },
  { key: "punjabi", name: "Punjabi" },
  { key: "english", name: "English" },
  { key: "haryanvi", name: "Haryanvi" },
  { key: "bhojpuri", name: "Bhojpuri" },
  { key: "tamil", name: "Tamil" },
  { key: "telugu", name: "Telugu" },
  { key: "marathi", name: "Marathi" },
  { key: "bengali", name: "Bengali" },
  { key: "gujarati", name: "Gujarati" },
  { key: "kannada", name: "Kannada" },
  { key: "malayalam", name: "Malayalam" },
] as const

export type LangKey = (typeof LANGS)[number]["key"]
export const langName = (k: string) => LANGS.find((l) => l.key === k)?.name ?? k

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, "") || "music"
  )
}

export const songPath = (name: string, id: string) => `/song/${slugify(name)}/${id}`
export const albumPath = (name: string, id: string) => `/album/${slugify(name)}/${id}`
export const playlistPath = (name: string, id: string) => `/playlist/${slugify(name)}/${id}`
export const artistPath = (name: string, id: string) => `/artist/${slugify(name)}/${id}`

export function clip(s: string, n = 158) {
  if (s.length <= n) return s
  return s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,;:\-–\s]+$/, "") + "…"
}

export function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function fmtCount(n: number) {
  if (!n) return ""
  if (n >= 1e7) return `${(n / 1e7).toFixed(1).replace(/\.0$/, "")} crore`
  if (n >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, "")} lakh`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}
