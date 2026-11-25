const BASE = process.env.SAAVN_API_URL || "http://127.0.0.1:3008/api";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
async function api(path) {
  const r = await fetch(BASE + path, { headers: { "User-Agent": UA, Accept: "application/json" } });
  const j = await r.json();
  return j?.data;
}
function decode(s) {
  if (typeof s !== "string") return "";
  return s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").trim();
}
function img(arr, q = "500") {
  if (!Array.isArray(arr) || !arr.length) return typeof arr === "string" ? arr : "";
  const hit = arr.find((i) => String(i?.quality).startsWith(q)) ?? arr[arr.length - 1];
  return String(hit?.link ?? hit?.url ?? "").replace(/^http:/, "https:");
}
function toCard(r) {
  if (!r?.id) return null;
  const type = r.type === "song" ? "song" : r.type === "playlist" ? "playlist" : r.type === "artist" ? "artist" : "album";
  const name = decode(r.name ?? r.title);
  return { kind: type, id: String(r.id), name, image: img(r.image) };
}
const cards = (a) => (Array.isArray(a) ? a.map(toCard).filter(Boolean) : []);
async function run() {
  const d = await api("/modules?language=hindi");
  const res = {
    trendingSongs: (d.trending?.songs ?? []),
    trendingAlbums: cards(d.trending?.albums),
    albums: cards(d.albums),
    charts: cards(d.charts),
    playlists: cards(d.playlists),
  };
  console.log("SUCCESS trendingSongs:", res.trendingSongs.length);
  console.log("trendingAlbums:", res.trendingAlbums.length);
  console.log("albums:", res.albums.length);
  console.log("charts:", res.charts.length);
  console.log("playlists:", res.playlists.length);
}
run();
