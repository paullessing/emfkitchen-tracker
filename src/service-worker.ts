/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  '/',
  ...build, // the app itself
  ...files, // everything in `static`
];

self.addEventListener('install', ((event: ExtendableEvent) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  // console.log('Installed', ASSETS);

  event.waitUntil(addFilesToCache());
}) as any);

self.addEventListener('activate', ((event: ExtendableEvent) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
}) as any);

self.addEventListener('fetch', ((event: FetchEvent) => {
  // console.log(event.request.method, event.request.url);

  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // cache.keys().then((keys) => console.table(keys.map((req) => [req.method, req.url])));

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      // console.log('Known asset');
      const response = await cache.match(url.pathname);

      if (response) {
        return response;
      }
      // console.log('Asset not found');
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      console.log('Trying directly', event.request.url);
      const response = await fetch(event.request);

      // if we're offline, fetch can return a value that is not a Response
      // instead of throwing - and we can't pass this non-Response to respondWith
      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch');
      }

      if (response.status === 200) {
        // console.log('Putting into cache');
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      const response = await cache.match(event.request);

      // console.log('Found cache version', event.request.url, !!response);
      if (response) {
        return response;
      }
      // console.log('No found');

      // if there's no cache, then just error out
      // as there is nothing we can do to respond to this request
      throw err;
    }
  }

  event.respondWith(respond());
}) as any);
