/** @type {import("next").NextConfig} */
module.exports = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/saavn/:path*",
        destination: "http://127.0.0.1:3008/api/:path*",
      },
    ]
  },
}

