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

/** Mood / activity collections. `q` = JioSaavn playlist searches merged into one page. */
export const MOODS = [
  { key: "meditation", name: "Meditation", emoji: "🧘", tint: "from-teal-500/40", q: ["meditation", "meditation mantra", "relaxing flute", "spiritual healing"], blurb: "Calm mantras, flute and ambient music for meditation, yoga and mindfulness." },
  { key: "sleep", name: "Sleep", emoji: "🌙", tint: "from-indigo-500/40", q: ["sleep", "deep sleep", "lullaby", "rain sounds"], blurb: "Soft, slow music to help you fall asleep – set the sleep timer and drift off." },
  { key: "focus", name: "Focus & Study", emoji: "📚", tint: "from-sky-500/40", q: ["study", "focus", "lofi", "instrumental"], blurb: "Lo-fi beats and instrumentals that help you concentrate while studying or working." },
  { key: "workout", name: "Workout", emoji: "💪", tint: "from-orange-500/40", q: ["workout", "gym", "running", "power"], blurb: "High-energy Bollywood, Punjabi and English tracks for the gym and your run." },
  { key: "romantic", name: "Romantic", emoji: "❤️", tint: "from-rose-500/40", q: ["romantic", "love songs", "romance hindi"], blurb: "The best romantic songs – Bollywood love songs, duets and soft melodies." },
  { key: "sad", name: "Sad & Heartbreak", emoji: "💔", tint: "from-slate-500/40", q: ["sad songs", "heartbreak", "breakup"], blurb: "Emotional sad songs and heartbreak hits for when you need a good cry." },
  { key: "party", name: "Party", emoji: "🎉", tint: "from-fuchsia-500/40", q: ["party", "dance hits", "club"], blurb: "Party anthems and dance floor hits in Hindi, Punjabi and English." },
  { key: "devotional", name: "Devotional", emoji: "🙏", tint: "from-amber-500/40", q: ["devotional", "bhajan", "aarti", "shiv"], blurb: "Bhajans, aartis, mantras and devotional songs for puja and peaceful mornings." },
  { key: "road-trip", name: "Road Trip", emoji: "🚗", tint: "from-emerald-500/40", q: ["road trip", "travel", "long drive"], blurb: "Long drive songs and travel playlists for the open road." },
  { key: "retro", name: "Retro & 90s", emoji: "📻", tint: "from-yellow-500/40", q: ["90s", "retro", "old is gold", "80s bollywood"], blurb: "Old is gold – evergreen 70s, 80s and 90s Bollywood classics." },
  { key: "sufi", name: "Sufi & Ghazal", emoji: "🕌", tint: "from-lime-500/40", q: ["sufi", "ghazal", "qawwali"], blurb: "Soulful sufi songs, ghazals and qawwalis." },
  { key: "chill", name: "Chill", emoji: "☕", tint: "from-cyan-500/40", q: ["chill", "acoustic", "unplugged"], blurb: "Relaxed acoustic and unplugged songs to unwind with." },
  { key: "wedding", name: "Wedding", emoji: "💍", tint: "from-red-500/40", q: ["wedding", "sangeet", "shaadi"], blurb: "Sangeet, mehendi and baraat songs for the big fat Indian wedding." },
  { key: "bus-driver", name: "Bus Driver", emoji: "🚌", tint: "from-yellow-600/40", q: ["90s kumar sanu", "alka yagnik", "udit narayan", "dard bhare", "truck driver", "bus driver"], blurb: "Full volume, dard bhare – 90s Kumar Sanu, Alka Yagnik and Udit Narayan hits, exactly what the bus driver plays on the highway." },
  { key: "kids", name: "Kids", emoji: "🧸", tint: "from-pink-500/40", q: ["kids", "nursery rhymes", "children"], blurb: "Nursery rhymes and fun songs for children." },
] as const

export const moodPath = (key: string) => `/mood/${key}`
