import { useEffect, useState } from "react";
import StockTable from "./StockTable.jsx";

// Slugs known by the backend: GET /api/company/{slug}/stocks
const COMPANIES = ["shizuka", "mokume", "kinari", "sumi"];

// Our own build version: version.txt sits next to index.html (relative URL, so under /dashboard/)
function useText(url) {
  const [text, setText] = useState("…");
  useEffect(() => {
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => setText(t.trim() || "dev"))
      .catch(() => setText("dev"));
  }, [url]);
  return text;
}

// The backend's version, from GET /api/status. Shows that the two apps talk to each other.
function useBackendVersion() {
  const [version, setVersion] = useState("…");
  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((s) => setVersion(s.version))
      .catch(() => setVersion("unreachable"));
  }, []);
  return version;
}

export default function App() {
  const version = useText("version.txt");
  const backend = useBackendVersion();

  return (
    <>
      <header className="nav">
        <a className="brand" href="/" aria-label="Kanso home">
          <span className="hanko" aria-hidden="true">簡</span>
          <span className="brand-name">Kanso</span>
        </a>
        <nav aria-label="Primary">
          <a href="/">Home</a>
          <a href="/dashboard/" aria-current="page">Dashboard</a>
          <a href="/release">Release</a>
        </nav>
      </header>

      <main className="page">
        <p className="eyebrow mono">市場 · market</p>
        <h1>Four quiet makers.<br />One small market.</h1>
        <p className="lede mono">
          Prices are placeholders from the backend: one series per company, fetched once and replayed every second.
        </p>

        <section className="grid">
          {COMPANIES.map((slug) => (
            <StockTable key={slug} slug={slug} />
          ))}
        </section>
      </main>

      <footer className="footer mono">
        <span>dashboard v{version}</span>
        <span>backend v{backend}</span>
      </footer>
    </>
  );
}
