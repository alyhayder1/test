import { apiFetch } from "../lib/api";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}