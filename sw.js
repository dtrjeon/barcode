const CACHE_NAME = 'barcode-scanner-v2';
const APP_SHELL = [
  './barcode_scanner.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 앱 셸(같은 출처의 html/manifest/아이콘)은 네트워크 우선.
  // 최신 버전을 항상 먼저 시도하고, 오프라인일 때만 캐시로 대체.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // 제품 조회 API, 구글시트 저장, CDN 라이브러리 등 외부 요청은 항상 네트워크 우선
  // (실시간성이 중요하고 오프라인 캐시 의미가 없음)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
