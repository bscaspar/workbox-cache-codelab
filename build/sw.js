/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
    console.log('Workbox loaded');

    workbox.precaching.precacheAndRoute([
  {
    "url": "style/main.css",
    "revision": "628320e3f89c25f36472cda3e970e57d"
  },
  {
    "url": "index.html",
    "revision": "3fa85de7568743582370032fd44af350"
  },
  {
    "url": "js/animation.js",
    "revision": "8952a6ec2786e6e8d62a7934bc7f1c1f"
  },
  {
    "url": "images/home/business.jpg",
    "revision": "9c3ec8d2a8a188bab9ddc212a64a0c1e"
  },
  {
    "url": "pages/offline.html",
    "revision": "09b9feaee1fbd9d3f27253d24b7911c9"
  },
  {
    "url": "pages/404.html",
    "revision": "1a6cf0261a93d2c998c813d5588856bb"
  }
]);

    workbox.routing.registerRoute(
        /(.*)articles(.*)\.(?:png|gif|jpg)/,
        workbox.strategies.cacheFirst({
            cacheName: 'images-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60
                })
            ]
        })
    )

    workbox.routing.registerRoute(
        /images\/icon\/.+/,
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'icon-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 5
                })
            ]
        })
    )

    const articleHandler = workbox.strategies.networkFirst({
        cacheName: 'articles-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50
            })
        ]
    });

    workbox.routing.registerRoute(/(.*)article(.*)\.html/, args => {
        return articleHandler.handle(args)
            .then(response => {
                if (!response) {
                    return caches.match('pages/offline.html');
                } else if (response.status === 404) {
                    return caches.match('pages/404.html');
                }
                return response;
            })
    })

    const postHandler = workbox.strategies.cacheFirst({
        cacheName: 'post-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50
            })
        ]
    });

    workbox.routing.registerRoute(/pages\/post.+\.html/, args => {
        return postHandler.handle(args)
            .then(response => {
                if (response.status === 404) {
                    return caches.match('pages/404.html');
                }
                return response;
            })
            .catch((e) => {
                return caches.match('pages/offline.html');
            });
    })

} else {
    console.log(`Workbox didn't load :(`)
}