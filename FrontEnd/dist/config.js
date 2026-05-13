// Runtime config loaded BEFORE the SPA bundle.
// Override by bind-mounting an external file at /usr/share/nginx/html/config.js.
// Keys here mirror VITE_* env vars; missing keys fall back to build-time values.
window.__APP_CONFIG__ = {
  // Empty string = use relative URLs (proxied by nginx /api/ → backend).
  // Set to e.g. "https://api.example.com" to point at a different host.
  VITE_API_BASE_URL: '',
  VITE_API_PREFIX: '/api',
  VITE_BACKEND_PORT: '8021',
};
