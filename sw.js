const CACHE_NAME = 'leo-arcade-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './neon-dodge/index.html',
  './luge/index.html',
  './defense/index.html',
  './icon-192.png',
  './icon-512.png'
  // 만약 css 파일이나 다른 이미지가 있다면 여기에 추가
];

// 1. 설치 (Install): 캐시 파일 저장
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. 활성화 (Activate): 구버전 캐시 삭제
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. 요청 가로채기 (Fetch): 캐시된거 있으면 그거 주고, 없으면 인터넷에서 가져오기
self.addEventListener('fetch', (evt) => {
  // Firestore나 외부 API 요청은 캐시하지 않고 네트워크로 직행 (Auth 오류 방지)
  if (evt.request.url.includes('firestore') || 
      evt.request.url.includes('googleapis') ||
      evt.request.method !== 'GET') {
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      // 캐시에 있으면 반환, 없으면 네트워크 요청
      return cachedResponse || fetch(evt.request);
    })
  );
});
