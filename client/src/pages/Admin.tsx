import { useState } from "react";
import { apiFetch } from "../lib/api";

const API = import.meta.env.VITE_API_BASE;

export default function Admin() {
  const [name, setName] = useState("Ali");
  const [age, setAge] = useState(25);
  const [city, setCity] = useState("Karachi");
  const [bio, setBio] = useState("Made this for you 😊");

  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);

  const [createdUrl, setCreatedUrl] = useState("");

  async function onCreate() {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("age", String(age));
    fd.append("city", city);
    fd.append("bio", bio);
    if (photo) fd.append("photo", photo);
    if (audio) fd.append("audio", audio);

    const res = await apiFetch(`${API}/pages`, { method: "POST", body: fd });
    const json = await res.json();
    setCreatedUrl(`${window.location.origin}/v/${json.slug}`);
  }

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Admin</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="number" value={age} onChange={(e) => setAge(+e.target.value)} placeholder="Age" />
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} />

      <div style={{ marginTop: 10 }}>
        <div>Photo</div>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
      </div>

      <div style={{ marginTop: 10 }}>
        <div>Audio (mp3)</div>
        <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] || null)} />
      </div>

      <button onClick={onCreate} style={{ marginTop: 12 }}>
        Create Page
      </button>

      {createdUrl && (
        <div style={{ marginTop: 14 }}>
          <div>Send this link:</div>
          <a href={createdUrl}>{createdUrl}</a>
        </div>
      )}
    </div>
  );
}
