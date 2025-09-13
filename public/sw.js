// Memory Maths Service Worker
const CACHE_NAME = 'memory-maths-v1';

// Basic service worker for installability
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler - just pass through requests
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});