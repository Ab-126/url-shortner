import { useState, useEffect } from "react";

const API = "http://localhost:8000";

// ── tiny helpers ──────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function shortLink(code) {
  return `http://localhost:8000/${code}`;
}

// ── components ────────────────────────────────────────────────

function Toaster({ message, type }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 1000,
      background: type === "error" ? "#ff4d4d" : "#00ff88",
      color: "#0a0a0a", padding: "10px 20px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
      fontWeight: 600, boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      animation: "fadeSlide .25s ease",
    }}>
      {type === "error" ? "✗ " : "✓ "}{message}
    </div>
  );
}

function StatsBadge({ label, value, accent }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #222",
      borderRadius: 6, padding: "14px 20px", flex: 1, minWidth: 100,
    }}>
      <div style={{ color: accent || "#00ff88", fontSize: 22, fontWeight: 700,
        fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      <div style={{ color: "#555", fontSize: 11, marginTop: 4,
        textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function StatsModal({ code, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/stats/${code}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [code]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 500, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #2a2a2a",
        borderRadius: 10, padding: 32, minWidth: 400, maxWidth: 520,
        boxShadow: "0 24px 80px rgba(0,255,136,.07)",
        animation: "modalIn .2s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 24 }}>
          <span style={{ color: "#00ff88", fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13, letterSpacing: 1 }}>// STATS</span>
          <button onClick={onClose} style={{ background: "none", border: "none",
            color: "#555", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {loading ? (
          <div style={{ color: "#444", fontFamily: "monospace", textAlign: "center",
            padding: "32px 0" }}>loading...</div>
        ) : stats ? (
          <>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 8,
              fontFamily: "monospace" }}>TARGET URL</div>
            <div style={{ color: "#ccc", fontSize: 13, wordBreak: "break-all",
              marginBottom: 24, padding: "10px 14px", background: "#111",
              borderRadius: 6, border: "1px solid #222",
              fontFamily: "'IBM Plex Mono', monospace" }}>
              {stats.target_url}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <StatsBadge label="Total Clicks" value={stats.clicks} accent="#00ff88" />
              <StatsBadge label="Short Code" value={stats.short_code} accent="#4d9fff" />
              <StatsBadge label="Created" value={timeAgo(stats.created_at)} accent="#ff9f4d" />
            </div>
            <div style={{ color: "#444", fontSize: 12,
              fontFamily: "monospace", textAlign: "center" }}>
              {shortLink(stats.short_code)}
            </div>
          </>
        ) : (
          <div style={{ color: "#ff4d4d", fontFamily: "monospace" }}>Failed to load stats.</div>
        )}
      </div>
    </div>
  );
}

function URLRow({ entry, onCopy, onStats }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 18px", borderRadius: 7,
        background: hovered ? "#111" : "transparent",
        border: "1px solid", borderColor: hovered ? "#2a2a2a" : "transparent",
        transition: "all .15s ease", cursor: "default",
      }}>
      {/* short link */}
      <a href={shortLink(entry.short_code)} target="_blank" rel="noreferrer"
        style={{ color: "#00ff88", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13, textDecoration: "none", minWidth: 180,
          ":hover": { textDecoration: "underline" } }}>
        /{entry.short_code}
      </a>

      {/* target */}
      <span style={{ color: "#555", fontSize: 12, flex: 1,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontFamily: "monospace" }}>
        {entry.target_url}
      </span>

      {/* clicks */}
      <span style={{ color: "#444", fontSize: 12,
        fontFamily: "monospace", minWidth: 60, textAlign: "right" }}>
        {entry.clicks} click{entry.clicks !== 1 ? "s" : ""}
      </span>

      {/* time */}
      <span style={{ color: "#333", fontSize: 11,
        fontFamily: "monospace", minWidth: 64, textAlign: "right" }}>
        {timeAgo(entry.created_at)}
      </span>

      {/* actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onCopy(entry.short_code)}
          style={{ background: "none", border: "1px solid #2a2a2a",
            color: "#555", borderRadius: 4, padding: "4px 10px",
            fontSize: 11, cursor: "pointer", fontFamily: "monospace",
            transition: "all .15s", ":hover": { color: "#fff" } }}>
          copy
        </button>
        <button onClick={() => onStats(entry.short_code)}
          style={{ background: "none", border: "1px solid #2a2a2a",
            color: "#555", borderRadius: 4, padding: "4px 10px",
            fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
          stats
        </button>
      </div>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────
export default function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [statsCode, setStatsCode] = useState(null);
  const [latestCode, setLatestCode] = useState(null);

  // load all URLs on mount
  useEffect(() => { fetchAll(); }, []);

  // auto-hide toast
  useEffect(() => {
    if (!toast.message) return;
    const t = setTimeout(() => setToast({ message: "", type: "success" }), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchAll() {
    try {
      const res = await fetch(`${API}/urls/all`);
      const data = await res.json();
      setUrls(data);
    } catch {
      showToast("Could not reach backend", "error");
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  async function handleShorten() {
    if (!inputUrl.trim()) return showToast("Enter a URL first", "error");
    if (!/^https?:\/\//i.test(inputUrl))
      return showToast("URL must start with http:// or https://", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: inputUrl.trim() }),
      });
      const data = await res.json();
      setLatestCode(data.short_code);
      setInputUrl("");
      showToast("Short URL created!");
      fetchAll();
    } catch {
      showToast("Failed to shorten URL", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(code) {
    navigator.clipboard.writeText(shortLink(code));
    showToast("Copied to clipboard!");
  }

  return (
    <>
      {/* global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&family=IBM+Plex+Sans:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #ccc; font-family: 'IBM Plex Sans', sans-serif; }
        ::selection { background: #00ff8833; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        input::placeholder { color: #333; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <Toaster {...toast} />
      {statsCode && <StatsModal code={statsCode} onClose={() => setStatsCode(null)} />}

      <div style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 760,
        margin: "0 auto" }}>

        {/* header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: "#00ff88", fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
              url-shortener
            </span>
            <span style={{ color: "#1a1a1a", fontSize: 11 }}>|</span>
            <span style={{ color: "#333", fontFamily: "monospace", fontSize: 11 }}>v1.0.0</span>
            <span style={{ display: "inline-block", width: 7, height: 14,
              background: "#00ff88", marginLeft: 4,
              animation: "blink 1.1s step-end infinite" }} />
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5,
            fontFamily: "'IBM Plex Mono', monospace", color: "#fff",
            lineHeight: 1.1 }}>
            shorten<span style={{ color: "#00ff88" }}>.</span>
          </h1>
          <p style={{ color: "#444", fontSize: 14, marginTop: 10, fontWeight: 300 }}>
            paste a long URL, get a short one — track every click
          </p>
        </div>

        {/* input bar */}
        <div style={{ display: "flex", gap: 0, marginBottom: 48,
          border: "1px solid #222", borderRadius: 8, overflow: "hidden",
          background: "#0d0d0d", transition: "border-color .2s",
          ":focus-within": { borderColor: "#00ff88" } }}>
          <span style={{ padding: "0 16px", display: "flex", alignItems: "center",
            color: "#2a2a2a", fontFamily: "monospace", fontSize: 14,
            borderRight: "1px solid #1a1a1a", userSelect: "none" }}>
            $
          </span>
          <input
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleShorten()}
            placeholder="https://your-very-long-url.com/goes/here"
            style={{ flex: 1, background: "transparent", border: "none",
              outline: "none", padding: "16px 18px", color: "#ddd",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}
          />
          <button onClick={handleShorten} disabled={loading}
            style={{ background: loading ? "#0a2a1a" : "#00ff88",
              color: loading ? "#00ff88" : "#0a0a0a",
              border: "none", padding: "0 28px", cursor: loading ? "wait" : "pointer",
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
              fontSize: 13, letterSpacing: .5, transition: "all .2s",
              whiteSpace: "nowrap" }}>
            {loading ? "..." : "→ shorten"}
          </button>
        </div>

        {/* latest result banner */}
        {latestCode && (
          <div style={{ marginBottom: 32, padding: "16px 20px",
            background: "#001a0d", border: "1px solid #00ff8830",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16,
            animation: "fadeSlide .3s ease" }}>
            <div>
              <div style={{ color: "#00ff8877", fontSize: 10, fontFamily: "monospace",
                letterSpacing: 1, marginBottom: 4 }}>LATEST</div>
              <a href={shortLink(latestCode)} target="_blank" rel="noreferrer"
                style={{ color: "#00ff88", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                {shortLink(latestCode)}
              </a>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleCopy(latestCode)}
                style={{ background: "#00ff8815", border: "1px solid #00ff8840",
                  color: "#00ff88", borderRadius: 5, padding: "7px 16px",
                  fontSize: 12, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                copy
              </button>
              <button onClick={() => setStatsCode(latestCode)}
                style={{ background: "none", border: "1px solid #222",
                  color: "#555", borderRadius: 5, padding: "7px 16px",
                  fontSize: 12, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                stats
              </button>
            </div>
          </div>
        )}

        {/* url list */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: "#333", fontFamily: "monospace",
              fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>
              // all links ({urls.length})
            </span>
            <button onClick={fetchAll}
              style={{ background: "none", border: "none", color: "#333",
                cursor: "pointer", fontFamily: "monospace", fontSize: 11 }}>
              ↻ refresh
            </button>
          </div>

          {urls.length === 0 ? (
            <div style={{ color: "#2a2a2a", fontFamily: "monospace",
              fontSize: 13, padding: "40px 0", textAlign: "center" }}>
              no links yet — shorten one above
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {urls.map(entry => (
                <URLRow key={entry.short_code} entry={entry}
                  onCopy={handleCopy} onStats={setStatsCode} />
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ marginTop: 80, borderTop: "1px solid #111",
          paddingTop: 24, textAlign: "center",
          color: "#2a2a2a", fontFamily: "monospace", fontSize: 11 }}>
          built with fastapi + react
        </div>
      </div>
    </>
  );
}