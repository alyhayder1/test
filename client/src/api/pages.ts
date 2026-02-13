import { api } from "./client";

export type Page = {
  slug: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  photoUrl: string;
  audioUrl: string;
};

export function createPage(body: Partial<Page>) {
  return api<{ slug: string }>("/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify(body),
  });
}

export function getPage(slug: string) {
  return api<Page>(`/pages/${slug}`);
}

export function trackVisit(slug: string, path: string) {
  return api<{ visitId: string }>("/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify({ slug, path }),
  });
}