/** Client-safe shapes passed from server pages to client components. */
export type Track = {
  id: string
  name: string
  artists: string
  image: string
  thumb: string
  href: string
  src?: string // 320kbps stream; resolved on play when missing
  duration?: number
  album?: string
}

export type Card = {
  kind: "song" | "album" | "playlist" | "artist"
  id: string
  name: string
  subtitle: string
  image: string
  href: string
}
