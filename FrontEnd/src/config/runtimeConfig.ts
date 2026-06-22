/**
 * Runtime config resolver.
 *
 * Reads from `window.__APP_CONFIG__` (populated by /config.js at page load)
 * with `import.meta.env.VITE_*` as a build-time fallback.
 *
 * This lets a deployed image be re-pointed at a different backend just by
 * editing the externally-mounted /config.js — no rebuild required.
 */

type RuntimeConfigShape = Partial<{
  VITE_API_BASE_URL: string;
  VITE_API_PREFIX: string;
  VITE_BACKEND_PORT: string;
}>;

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfigShape;
  }
}

const win: RuntimeConfigShape =
  typeof window !== 'undefined' && window.__APP_CONFIG__ ? window.__APP_CONFIG__ : {};

export function getRuntimeEnv(key: keyof RuntimeConfigShape): string | undefined {
  if (key in win) return win[key];
  return import.meta.env[key] as string | undefined;
}

export {};
