const API = import.meta.env.VITE_API_BASE;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("ngrok-skip-browser-warning", "true");

  // If you use JSON:
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API}${path}`, { ...init, headers });
}