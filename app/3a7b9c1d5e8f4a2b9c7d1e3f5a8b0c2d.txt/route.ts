export function GET() {
  return new Response("3a7b9c1d5e8f4a2b9c7d1e3f5a8b0c2d", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
