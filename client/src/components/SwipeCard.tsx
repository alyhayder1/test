import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string;
  age: number;
  city: string;
  bio: string;
  photoUrl: string;
  audioUrl?: string;
};

export default function SwipeCard({ name, age, city, bio, photoUrl, audioUrl }: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dxRef = useRef(0);
  const dyRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const retriedRef = useRef(false);


  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (!photoUrl) return;
    const bust = `v=${Date.now()}`;
    setImgSrc(photoUrl + (photoUrl.includes("?") ? "&" : "?") + bust);
  }, [photoUrl]);

  const threshold = 120;

  const yesOpacity = dx > 0 ? Math.min(dx / threshold, 1) : 0;
  const noOpacity = dx < 0 ? Math.min(Math.abs(dx) / threshold, 1) : 0;

  const transform = useMemo(() => {
    const rot = (dx / 320) * 14;
    return `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
  }, [dx, dy]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1600);
  }

  async function unlockAudio() {
    if (audioUnlockedRef.current) return;
    const a = audioRef.current;
    if (!a) return;

    try {
        a.muted = true;
        a.currentTime = 0;
        await a.play();     // must be inside user gesture
        a.pause();
        a.muted = false;
        audioUnlockedRef.current = true;
    } catch {
        // If it fails, user can still play via button
    }
    }

  function replayMusic() {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
      a.load(); // ✅ important for mobile Safari/Chrome sometimes
      a.play().catch(() => {});
    } catch {}
  }

  function resetCard() {
    dxRef.current = 0;
    dyRef.current = 0;
    setDx(0);
    setDy(0);
    setDragging(false);
  }

  function acceptYes() {
    // fling card out
    dxRef.current = 600;
    dyRef.current = -50;
    setDx(600);
    setDy(-50);
    setDragging(false);

    // 🔊 Mobile-safe audio play (Safari/Chrome)
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
        a.load();              // ✅ IMPORTANT for mobile browsers
        a.volume = 0.75;
        a.play().catch(() => {});
      } catch {}
    }

    // ✅ Log right swipe (use apiFetch, not raw fetch)
    fetch("/right-swipes", {
      method: "POST",
      body: JSON.stringify({
        slug: window.location.pathname.split("/").pop(),
      }),
    }).catch(() => {});

    // UI can be delayed
    window.setTimeout(() => {
      setOverlay(true);
      startHearts();
    }, 160);
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    a.load();
  }, [audioUrl]);

  function rejectNo() {
    // "No" is disabled -> playful bounce
    showToast("Try again 😄");
    resetCard();
  }

  // Pointer handling (touch + mouse)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function onDown(e: PointerEvent) {
        // Only left click for mouse
        if (e.pointerType === "mouse" && e.button !== 0) return;

        unlockAudio();

        draggingRef.current = true;
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;

        setDragging(true); // just for UI transitions
        // Prevent weird selection/scroll interactions
        e.preventDefault();

        // Capture pointer so moves keep coming even if finger leaves the card
        (el as any).setPointerCapture?.(e.pointerId);
    }

    function onMove(e: PointerEvent) {
        if (!draggingRef.current) return;
        e.preventDefault();

        const dxNow = e.clientX - startXRef.current;
        const dyNow = e.clientY - startYRef.current;

        dxRef.current = dxNow;
        dyRef.current = dyNow;

        setDx(dxNow);
        setDy(dyNow);
    }

    function onUp(e?: PointerEvent) {
        e?.preventDefault?.();
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setDragging(false);

        // Decide based on latest dx in state (good enough)
        // If you want it perfect, you can store dx/dy in refs too.
        const finalDx = dxRef.current;

        if (finalDx > threshold) acceptYes();
        else if (finalDx < -threshold) rejectNo();
        else resetCard();
    }

    el.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: false });

    return () => {
        el.removeEventListener("pointerdown", onDown as any);
        window.removeEventListener("pointermove", onMove as any);
        window.removeEventListener("pointerup", onUp);
    };
    // 👇 attach ONCE
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  // Hearts canvas
  function startHearts() {
    const canvas = document.getElementById("hearts") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const hearts: any[] = [];
    const rand = (a: number, b: number) => Math.random() * (b - a) + a;

    const spawn = () => {
      hearts.push({
        x: rand(20, window.innerWidth - 20),
        y: window.innerHeight + 20,
        vx: rand(-25, 25),
        vy: rand(70, 150),
        size: rand(14, 26),
        rot: rand(-0.7, 0.7),
        vr: rand(-1.2, 1.2),
        life: 0,
        maxLife: rand(2.2, 3.6),
      });
    };

    let last = 0;
    const loop = (ts: number) => {
      const t = ts / 1000;
      const dt = Math.min(0.033, t - last);
      last = t;

      if (hearts.length < 80 && Math.random() < 0.7) spawn();

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.life += dt;
        h.y -= h.vy * dt;
        h.x += h.vx * dt;
        h.rot += h.vr * dt;

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.globalAlpha = Math.max(0, 1 - h.life / h.maxLife);
        ctx.font = `${h.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.fillText("❤", -h.size / 2, h.size / 2);
        ctx.restore();

        if (h.life > h.maxLife || h.y < -40) hearts.splice(i, 1);
      }

      if (overlay) requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  return (
    <div style={styles.page}>
      <canvas id="hearts" style={styles.canvas} />

      <div style={styles.header}>
        <div style={styles.title}>Valentinder with me?</div>
        <div style={styles.subtitle}>30rs ki pepsi apka bhai sexy</div>
      </div>

      <div
        ref={cardRef}
        style={{
          ...styles.card,
          touchAction: "none",
          userSelect: "none",
          transform,
          transition: dragging ? "none" : "transform .18s ease",
        }}
      >
        <div style={styles.photoWrap}>
          <img
            src={imgSrc || photoUrl}
            alt="profile"
            style={styles.photo}
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
            onError={() => {
              if (retriedRef.current) return;
              retriedRef.current = true;
              const bust = `v=${Date.now()}`;
              setImgSrc(photoUrl + (photoUrl.includes("?") ? "&" : "?") + bust);
            }}
          />
          <div style={styles.badge}>
            <span style={styles.dot} /> Last online an hour ago
          </div>

          <div style={{ ...styles.stamp, ...styles.stampNo, opacity: noOpacity }}>NOPE</div>
          <div style={{ ...styles.stamp, ...styles.stampYes, opacity: yesOpacity }}>YES</div>
        </div>

        <div style={styles.info}>
          <div style={styles.nameRow}>
            <div style={styles.name}>
              {name}, {age}
            </div>
            <div style={styles.meta}>{city} • 🇩🇪</div>
          </div>

          <div style={styles.bio}>{bio}</div>

          <div style={styles.actions}>
            <button onClick={rejectNo} style={{ ...styles.btn, ...styles.btnNo }} title="No">
              ✖
            </button>
            <button onClick={acceptYes} style={{ ...styles.btn, ...styles.btnYes }} title="Yes">
              ❤
            </button>
          </div>
        </div>
      </div>

      {toast && <div style={{ ...styles.toast, opacity: 1 }}>{toast}</div>}

      {overlay && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.big}>💖</div>
            <div style={styles.h2}>Hope this made your day 🫶🫰</div>
            <div style={styles.p}>
              PS: I'm still waiting on the treat from you 😉
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={replayMusic} style={styles.pill}>
                🔊 Turn music on
              </button>
              <button onClick={() => window.location.reload()} style={styles.pill}>
                😊 Let's chat
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={audioUrl || ""} preload="auto" playsInline />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, #2a1747 0%, transparent 55%), radial-gradient(1000px 700px at 80% 30%, #0b4a7d 0%, transparent 60%), linear-gradient(180deg, #0b0b12, #141425)",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",   // 👈 instead of center
    paddingTop: 60,                  // 👈 pushes card higher
    paddingBottom: 20,
    paddingLeft: 18,
    paddingRight: 18,
    overflow: "hidden",
  },
  canvas: { position: "fixed", inset: 0, pointerEvents: "none" },
  header: { textAlign: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 800 },
  subtitle: { fontSize: 13, color: "#a1a1aa", marginTop: 6 },

  card: {
    width: "min(420px, 100%)",
    borderRadius: 26,
    background: "linear-gradient(180deg, #0f172acc, #0b1225cc)",
    border: "1px solid #ffffff20",
    boxShadow: "0 20px 80px #00000066",
    overflow: "hidden",
    touchAction: "none",
    userSelect: "none",
  },
  photoWrap: { height: 360, position: "relative" },
  photo: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    padding: "8px 10px",
    fontSize: 12,
    borderRadius: 999,
    border: "1px solid #ffffff26",
    background: "#00000055",
    backdropFilter: "blur(10px)",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 999, background: "#22c55e", boxShadow: "0 0 18px #22c55e" },

  stamp: {
    position: "absolute",
    top: 22,
    right: 18,
    padding: "10px 14px",
    borderRadius: 16,
    fontWeight: 900,
    letterSpacing: 2,
    background: "#00000033",
    backdropFilter: "blur(8px)",
    border: "3px solid",
    pointerEvents: "none",
  },
  stampNo: { color: "#ef4444", borderColor: "#ef4444", transform: "rotate(12deg)" },
  stampYes: { color: "#22c55e", borderColor: "#22c55e", transform: "rotate(-10deg)" },

  info: { padding: "14px 16px 16px" },
  nameRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  name: { fontSize: 20, fontWeight: 900 },
  meta: { fontSize: 12, color: "#a1a1aa", whiteSpace: "nowrap" },
  bio: { fontSize: 13, lineHeight: 1.45, color: "#d4d4d8", marginTop: 10 },

  actions: { display: "flex", gap: 14, justifyContent: "center", paddingTop: 14 },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 999,
    border: "1px solid #ffffff1f",
    background: "#00000022",
    backdropFilter: "blur(10px)",
    fontSize: 22,
    cursor: "pointer",
  },
  btnNo: {},
  btnYes: {},

  toast: {
    position: "fixed",
    left: "50%",
    top: 18,                 // ✅ top of page
    transform: "translateX(-50%)",
    padding: "14px 18px",    // ✅ bigger
    borderRadius: 18,
    background: "#000000cc",
    border: "1px solid #ffffff2b",
    fontSize: 16,            // ✅ bigger text
    fontWeight: 800,
    letterSpacing: 0.2,
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 40px rgba(0,0,0,.45)",
    zIndex: 9999,
    maxWidth: "min(420px, 92vw)",
    textAlign: "center",
    },

  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20, // 👈 adds safe space from screen edges
    background:
      "radial-gradient(800px 500px at 50% 20%, #ff5fa230 0%, transparent 60%), linear-gradient(180deg, #00000088, #000000cc)",
  },

  modal: {
    width: "100%",
    maxWidth: 460,   // 👈 desktop limit
    borderRadius: 26,
    border: "1px solid #ffffff26",
    background: "#0b1225cc",
    boxShadow: "0 20px 90px #000000aa",
    backdropFilter: "blur(14px)",
    padding: 22,     // 👈 a bit more breathing room
    textAlign: "center",
  },
  big: { fontSize: 34, margin: "10px 0" },
  h2: { fontSize: 20, fontWeight: 800, margin: "6px 0" },
  p: { fontSize: 13, color: "#a1a1aa", lineHeight: 1.45, margin: "0 0 14px" },
  pill: {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid #ffffff26",
    background: "#ffffff12",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 700,
  },
};
