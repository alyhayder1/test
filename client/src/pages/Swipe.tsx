import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SwipeCard from "../components/SwipeCard";

const API = import.meta.env.VITE_API_BASE;

export default function Swipe() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        setError("");
        setPage(null);

        const res = await fetch(`${API}/pages/${slug}`);

        if (res.status === 404) {
          setError("Card not found");
          return;
        }
        if (!res.ok) {
          setError("Something went wrong");
          return;
        }

        const json = await res.json();
        setPage(json);

        // log visit (don’t block UI)
        fetch(`${API}/visits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, path: window.location.pathname }),
        }).catch(() => {});
      } catch {
        setError("Couldn’t load this card");
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
        <div style={{
          width: "min(420px, 100%)",
          borderRadius: 22,
          padding: 18,
          border: "1px solid #ffffff20",
          background: "#0b1225cc",
          color: "#e5e7eb"
        }}>
          <h2 style={{ margin: 0 }}>😕 {error}</h2>
          <p style={{ color: "#a1a1aa" }}>
            Double-check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!page) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <SwipeCard
      name={page.name}
      age={page.age}
      city={page.city}
      bio={page.bio}
      photoUrl={page.photoUrl}
      audioUrl={page.audioUrl}
    />
  );
}
