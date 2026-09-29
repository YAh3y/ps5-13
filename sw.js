const CACHE_NAME = "yahay-ps5-13-offline-v4";
const BASE = "/ps5-13/";
const CORE = [
  BASE, BASE+"index.html",
  BASE+"src/firmware.js", BASE+"src/main.js", BASE+"src/rop.js", BASE+"src/site.js",
  BASE+"src/webkit.js", BASE+"src/kexp.js", BASE+"src/relapse_exploit.js",
  BASE+"src/utils/int64.js", BASE+"src/utils/mem.js", BASE+"src/utils/rop_slave.js", BASE+"src/utils/syscalls.js"
];
const OFFSETS = ["7.00","7.01","7.20","7.40","7.60","7.61","8.00","8.20","8.40","8.60","9.00","9.20","9.40","9.60","10.00","10.01","10.20","10.40","10.60","11.00","11.20","11.60","12.00","12.02","12.20","12.40","12.60","12.70","13.00","13.20","13.40","13.42","13.60"].map(v=>BASE+"offsets/"+v+".js");
const PAYLOADS = ["elfldr-ps5-1360.elf","etaHEN.elf","kexp_2026_05_25.bin","kstuff.elf","shadowmountplus.elf"].map(v=>BASE+"payloads/"+v);
const ASSETS = [...CORE, ...OFFSETS, ...PAYLOADS];
self.addEventListener("install", event => event.waitUntil((async()=>{
  const c=await caches.open(CACHE_NAME);
  for (const u of ASSETS) { try { const r=await fetch(u,{cache:"reload"}); if(r.ok) await c.put(u,r); } catch(e){} }
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==CACHE_NAME) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || !url.pathname.startsWith(BASE)) return;
  event.respondWith((async()=>{
    const c=await caches.open(CACHE_NAME);
    const key=url.pathname.endsWith("/") ? BASE : url.pathname;
    let r=await c.match(key,{ignoreSearch:true});
    if(r) return r;
    try { r=await fetch(event.request); if(r && r.ok) c.put(key,r.clone()); return r; }
    catch(e) { if(event.request.mode==="navigate") return (await c.match(BASE)) || (await c.match(BASE+"index.html")); throw e; }
  })());
});
