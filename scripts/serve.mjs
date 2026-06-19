// Basit statik sunucu — VPS'te siteyi yayınlamak için (build gerektirmez).
//   npm run serve                          → http://0.0.0.0:8080
//   PORT=3000 npm run serve
//
// Private yayın (sadece sahibi görsün) için HTTP Basic Auth:
//   AUTH_USER=ben AUTH_PASS=gizli npm run serve
//   # veya tek değişkenle:
//   BASIC_AUTH="ben:gizli" npm run serve
// Kullanıcı/şifre verilmezse site herkese açık servis edilir (uyarı basılır).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { timingSafeEqual } from "node:crypto";

const PORT = process.env.PORT || 8080;
const ROOT = process.cwd();
const REALM = process.env.AUTH_REALM || "Altin Bilezik Takip";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

// Kimlik bilgilerini env'den oku: AUTH_USER/AUTH_PASS ya da BASIC_AUTH="user:pass".
function readCreds() {
  let user = process.env.AUTH_USER;
  let pass = process.env.AUTH_PASS;
  if ((!user || !pass) && process.env.BASIC_AUTH) {
    const i = process.env.BASIC_AUTH.indexOf(":");
    if (i !== -1) { user = process.env.BASIC_AUTH.slice(0, i); pass = process.env.BASIC_AUTH.slice(i + 1); }
  }
  return user && pass ? { user, pass } : null;
}
const CREDS = readCreds();

// Zamanlama saldırısına dayanıklı string karşılaştırma (uzunluk farkını da gizler).
function safeEqual(a, b) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Sabit zamanlı kalması için yine de bir karşılaştırma yap, sonra false dön.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

// Authorization başlığını doğrula. CREDS yoksa auth devre dışıdır → true.
function isAuthorized(req) {
  if (!CREDS) return true;
  const header = req.headers["authorization"] || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const i = decoded.indexOf(":");
  if (i === -1) return false;
  const user = decoded.slice(0, i);
  const pass = decoded.slice(i + 1);
  // Her iki alanı da karşılaştır; & ile kısa devre yapma (her ikisi de çalışsın).
  const okUser = safeEqual(user, CREDS.user);
  const okPass = safeEqual(pass, CREDS.pass);
  return okUser && okPass;
}

function requireAuth(res) {
  res.writeHead(401, {
    "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    "Content-Type": "text/plain; charset=utf-8",
  }).end("401 — kimlik dogrulamasi gerekli");
}

createServer(async (req, res) => {
  if (!isAuthorized(req)) { requireAuth(res); return; }
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = join(ROOT, normalize(p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("forbidden"); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404");
  }
}).listen(PORT, () => {
  console.log(`Site: http://0.0.0.0:${PORT}`);
  if (CREDS) console.log(`🔒 Basic Auth aktif (kullanıcı: ${CREDS.user})`);
  else console.log("⚠️  Auth KAPALI — site herkese açık. Private için AUTH_USER/AUTH_PASS ver.");
});
