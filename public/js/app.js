// Register service worker if it is supported by the browser
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
  .then(reg=> console.log('service worker registered', reg))
  .catch(err=> console.log((err)))
}