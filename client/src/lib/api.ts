const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://xxxx.ngrok-free.dev/api

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("ngrok-skip-browser-warning", "true");

  // Only set JSON header if body isn't FormData and header not already set
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  // Ensure path starts with "/"
  const p = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${API_BASE}${p}`, { ...init, headers });
}