const staticCacheName = 'site-static-v1'
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
  '/', 'index.html', 'pages/fallback.html',
  '/js/app.js', '/js/ui.js', '/js/materialize.min.js',
  '/css/materialize.min.css', '/css/styles.css',
  'https://raw.githubusercontent.com/iamshaunjp/pwa-tutorial/lesson-2/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
]

// cache size limit function
const limitCacheSize = (name, size)=>{
  caches.open(name)
    .then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0])
          .then(limitCacheSize(name, size))
      }
    })
  })
}

// Install Service Worker
self.addEventListener('install', e =>{
  // console.log(`service worker has been installed`)
  e.waitUntil(
    caches.open(staticCacheName) // Wait Until so cache finishes without aborting after installing
    .then(cache=>{
      console.log('caching shell assets')
      cache.addAll(assets)
  }))
})

// Activate event
self.addEventListener('activate', e =>{
  // console.log(`service worker has been activated`)
  // Delete all old caches when asset changes
  e.waitUntil(
    caches
    .keys()
    .then(keys=>{
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      )
    })
  )
})

// listen for a fetch event
self.addEventListener('fetch', e => {

  if(e.request.url.indexOf('firestore.googleapis.com') === -1){
    e.respondWith(
      // check if the document has been cached
      caches.match(e.request)
      .then(cacheRes => {
        return cacheRes || fetch(e.request)
          .then(fetchRes=>caches.open(dynamicCacheName)
            .then(cache => {
              cache.put(e.request.url, fetchRes.clone()) // Visited pages get fetched for offline vieweing
                limitCacheSize(dynamicCacheName, 15) // fire up cache cleaning function
                return fetchRes
            })
          ) 
      }).catch(()=>{
        if(e.request.url.indexOf('.html') > -1){ // Check if the request is a html file so lack of photos doesn't cause a fallback page to fire
          return caches.match('/pages/fallback.html')
        }
      })
    )
  }

})
