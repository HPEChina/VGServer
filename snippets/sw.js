// 只能在HTTPS或localhost网页上注册service workers.
var cacheId
// 缓存指定的资源
self.addEventListener('install', function (e) {
  e.waitUntil(
        caches.open(cacheId).then(function (cache) {
          return cache.addAll([
            '/',
            '/favicon.ico',
            '/es-checker.js'
          ])
        })
    )
})
// 监听访问请求,检测是否命中缓存
self.addEventListener('fetch', function (e) {
  e.respondWith(
        caches.match(e.request).then(function (response) {
          return response || fetch(e.request)
        })
    )
})
// 自动更新缓存
self.addEventListener('activate', function (e) {
  e.waitUntil(
        caches.keys().then(function (cacheNames) {
          return Promise.all(
                cacheNames.map(function (cacheName) {
                  if (cacheId.indexOf(cacheName) === -1) {
                    return caches.delete(cacheName)
                  }
                })
            )
        })
    )
})
