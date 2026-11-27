// Geldfluss – Service Worker: macht das Spiel offline spielbar.
// © 2026 Marcus Rapsch. Alle Rechte vorbehalten.
// Bei jeder Spieländerung VERSION erhöhen, damit Geräte die neue Fassung laden.
const VERSION = "geldfluss-v6";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Seite selbst: erst Netz (für Updates), sonst Cache (offline)
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // Übrige Dateien: Cache zuerst
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
