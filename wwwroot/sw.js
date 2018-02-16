importScripts('sw-toolbox.js');

const spCaches = {
    'static': 'static-v5',
    'dynamic': 'dynamic-v5'
};

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(spCaches.static).then(function (cache) {
            return cache.addAll([
                '/dist/main-client.js',
                '/dist/main-client.js.map',
                '/dist/site.css',
                '/dist/site.css.map',
                '/dist/vendor.css',
                '/dist/vendor.js',
                'offline.html'
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.filter(function (key) {
                    return !Object.values(spCaches).includes(key);
                }).map(function (key) {
                    return caches.delete(key);
                }));
            })
    );
});

toolbox.router.get('/dist/*', toolbox.cacheFirst, {
    cache: {
        name: spCaches.static,
        maxAgeSeconds: 60 * 60 * 24 * 365
    }
});

toolbox.router.get('/*', function(request, values, options){
    return toolbox.networkFirst(request, values, options)
    .catch(function(err){
        return caches.match(new Request('offline.html'));
    });
}, {
    networkTimeoutSeconds: 1,
    cache: {
        name: spCaches.dynamic,
        maxEntries: 5
    }
});


// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function (res) {
//                 if (res)
//                     return res;

//                 if (!navigator.onLine)
//                     return caches.match(new Request('offline.html'));

//                 return fetchAndUpdate(event.request);
//             })
//     );
// });

// function fetchAndUpdate(request) {
//     return fetch(request).then(function (res) {
//         if (res) {
//             return caches.open(version)
//                 .then(function (cache) {
//                     return cache.put(request, res.clone())
//                         .then(function () {
//                             return res;
//                         });
//                 });
//         }
//     });
// }