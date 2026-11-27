/** @type {import("next").NextConfig} */
module.exports = {
  poweredByHeader: false,
  images: { unoptimized: true }, // we use plain <img>; keeps the /_next/image optimizer (frequent CVE source) out of play
  async rewrites() {
    // Only what the browser player needs – not an open JioSaavn proxy.
    return [
      { source: "/api/saavn/songs/:id", destination: "http://127.0.0.1:3008/api/songs/:id" },
      { source: "/api/saavn/search/songs", destination: "http://127.0.0.1:3008/api/search/songs" },
    ]
  },
}
