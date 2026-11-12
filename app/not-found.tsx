import Link from "next/link"
import { SearchBox } from "@/components/ui"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">This page went off-beat</h1>
      <p className="mt-2 text-white/60">The song or page you&apos;re looking for doesn&apos;t exist. Try searching for it:</p>
      <div className="mt-6"><SearchBox big /></div>
      <Link href="/" className="mt-6 inline-block text-sm text-white/60 hover:text-white">← Back to home</Link>
    </div>
  )
}
