import { apiFetch } from "../lib/api";

export const API_BASE = import.meta.env.VITE_API_BASE;

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}