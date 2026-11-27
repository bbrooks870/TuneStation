"use client"

import Link from "next/link"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="text-5xl" aria-hidden="true">🎧</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Music service is busy</h1>
      <p className="mt-2 text-white/60">We couldn&apos;t load this page right now. Please try again in a moment.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-night-900 hover:bg-accent-2">
          Try again
        </button>
        <Link href="/" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
          Home
        </Link>
      </div>
    </div>
  )
}
