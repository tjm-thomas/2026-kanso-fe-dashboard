import { useCallback, useEffect, useState } from "react";

const ROWS = 8;          // prices shown per table
const TICK_MS = 1000;    // move to the next price every second

const yen = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * One company's table. Fetches the price series once from the backend, then cycles through it
 * (and starts over at the end), so the page doesn't call the backend every second.
 */
export default function StockTable({ slug }) {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    setError(null);
    fetch(`/api/company/${slug}/stocks`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((s) => { setSeries(s); setTick(0); })
      .catch((e) => setError(e.message));
  }, [slug]);

  useEffect(load, [load]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <article className="card">
        <p className="card-error mono">Backend unreachable for {slug}: {error}</p>
        <button className="btn" type="button" onClick={load}>Try again</button>
      </article>
    );
  }
  if (!series) {
    return <article className="card"><p className="mono muted">Loading {slug}…</p></article>;
  }

  const prices = series.prices;
  const n = prices.length;
  const at = (i) => prices[((i % n) + n) % n];
  const now = tick % n;
  const change = (i) => at(i) - at(i - 1);

  // Newest first: the current price, then the ones before it (wrapping around the series)
  const rows = Array.from({ length: Math.min(ROWS, n) }, (_, k) => now - k);

  return (
    <article className="card">
      <header className="card-head">
        <div>
          <h2>{series.name}</h2>
          <p className="muted">{series.sells}</p>
        </div>
        <span className="symbol mono">{series.symbol}</span>
      </header>

      <p className="price mono">
        ¥{yen.format(at(now))}
        <span className={change(now) >= 0 ? "up" : "down"}>
          {change(now) >= 0 ? "▲" : "▼"} {yen.format(Math.abs(change(now)))}
        </span>
      </p>

      <table className="mono">
        <thead>
          <tr><th>#</th><th>Price ({series.currency})</th><th>Change</th></tr>
        </thead>
        <tbody>
          {rows.map((i, k) => (
            <tr key={k} className={k === 0 ? "current" : undefined}>
              <td>{(((i % n) + n) % n) + 1}/{n}</td>
              <td>{yen.format(at(i))}</td>
              <td className={change(i) >= 0 ? "up" : "down"}>
                {change(i) >= 0 ? "+" : "−"}{yen.format(Math.abs(change(i)))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn" type="button" onClick={load}>New series</button>
    </article>
  );
}
