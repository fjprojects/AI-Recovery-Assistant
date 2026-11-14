import { useEffect, useMemo, useState } from "react";
import { getJson } from "./lib/api.js";

const iconFor = (category = "") => {
  const value = category.toLowerCase();
  if (value.includes("upper")) return "↗";
  if (value.includes("lower")) return "⌁";
  if (value.includes("ankle")) return "◌";
  return "✳";
};

export default function App() {
  const [exercises, setExercises] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [reviewList, setReviewList] = useState([]);

  async function loadLibrary() {
    setStatus("loading");
    setError("");
    try {
      const [health, data] = await Promise.all([
        getJson("/api/health/"),
        getJson("/api/exercises/"),
      ]);
      if (health.status !== "ok") throw new Error("The API health check did not pass.");
      setExercises(data.items ?? []);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Unable to load the movement library.");
      setStatus("error");
    }
  }

  useEffect(() => { loadLibrary(); }, []);

  const categories = useMemo(
    () => ["All", ...new Set(exercises.map((item) => item.category).filter(Boolean))],
    [exercises],
  );
  const visibleExercises = useMemo(() => {
    const text = query.toLowerCase().trim();
    return exercises.filter((item) => {
      const haystack = [item.name, item.category, item.description].join(" ").toLowerCase();
      return (category === "All" || item.category === category) && haystack.includes(text);
    });
  }, [exercises, category, query]);
  const selected = visibleExercises.find((item) => item.id === selectedId) ?? visibleExercises[0] ?? null;
  const saved = selected ? reviewList.includes(selected.id) : false;

  function toggleReview(id) {
    setReviewList((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Reform home"><span className="brand-symbol">✳</span><span>reform<span className="brand-sub"> / movement library</span></span></a>
        <div className="header-right">
          <span className={`system-status ${status}`}><i />{status === "ready" ? "API connected" : status === "loading" ? "Connecting" : "API unavailable"}</span>
          <a className="header-link" href="/prototype.html" target="_blank" rel="noreferrer">Original demo ↗</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MOVEMENT INFORMATION · CONCEPT PLATFORM</p>
          <h1>Support the journey.<br /><em>Respect every individual.</em></h1>
          <p className="hero-description">A thoughtful library interface for reviewing movement information and preparing questions for a qualified professional. Clear information, with clinical decisions kept where they belong.</p>
          <div className="hero-tags"><span>React interface</span><span>Django API</span><span>Professional-guided use</span></div>
        </div>
        <div className="hero-mark" aria-hidden="true"><div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><span>✳</span><small>REFORM / 01</small></div>
      </section>

      <section className="summary-row">
        <article className="summary-card"><span className="summary-icon">▤</span><div><strong>{exercises.length.toString().padStart(2, "0")}</strong><small>Library entries</small></div></article>
        <article className="summary-card"><span className="summary-icon">◈</span><div><strong>{categories.length > 0 ? categories.length - 1 : 0}</strong><small>Movement categories</small></div></article>
        <article className="summary-card"><span className="summary-icon">☆</span><div><strong>{reviewList.length.toString().padStart(2, "0")}</strong><small>Saved for discussion</small></div></article>
        <article className="summary-card summary-note"><span className="status-dot" /><div><strong>Concept build</strong><small>AI or camera analysis is not integrated</small></div></article>
      </section>

      <section className="library-section">
        <div className="section-heading">
          <div><p className="eyebrow">EXPLORE THE LIBRARY</p><h2>Movement references</h2><p className="section-subtitle">Browse the illustrative entries supplied by the Django API.</p></div>
          <span className="entry-count">{visibleExercises.length} of {exercises.length} entries</span>
        </div>
        <div className="library-toolbar">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the library…" aria-label="Search movement library" />{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
          <div className="category-filters" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip active" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>

        {status === "loading" && <div className="state-card">Loading the movement library…</div>}
        {status === "error" && <div className="state-card error-state"><strong>The movement library is unavailable.</strong><p>{error}</p><button className="outline-button" onClick={loadLibrary}>Try again</button></div>}
        {status === "ready" && visibleExercises.length === 0 && <div className="state-card"><strong>No matching entries</strong><p>Try another search or category.</p><button className="text-button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}

        <div className="library-layout">
          <div className="exercise-grid">
            {visibleExercises.map((item, index) => (
              <button key={item.id} className={selected?.id === item.id ? "exercise-card active" : "exercise-card"} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id}>
                <div className="exercise-card-top"><span className={`exercise-icon icon-${index % 3}`}>{iconFor(item.category)}</span><span className="card-arrow">↗</span></div>
                <span className="category-label">{item.category}</span>
                <strong>{item.name}</strong>
                <span className="card-description">{item.description}</span>
                <span className="card-bottom">View reference <span>→</span></span>
              </button>
            ))}
          </div>

          <aside className="detail-panel">
            <div className="detail-panel-head"><p className="eyebrow">REFERENCE DETAIL</p><span className="detail-badge">INFORMATION ONLY</span></div>
            {selected ? <>
              <div className="detail-icon">{iconFor(selected.category)}</div>
              <span className="category-label">{selected.category}</span>
              <h3>{selected.name}</h3>
              <p className="detail-copy">{selected.description}</p>
              <div className="professional-note"><strong>Professional guidance</strong><p>{selected.professional_note}</p></div>
              <button className={saved ? "save-button saved" : "save-button"} onClick={() => toggleReview(selected.id)}>{saved ? "✓ Saved for discussion" : "＋ Save for discussion"}</button>
              <p className="privacy-note">Your review list stays in this browser session. No personal or health information is collected.</p>
            </> : <div className="empty-detail">Select a library entry to view its details.</div>}
          </aside>
        </div>
      </section>

      <section className="boundary-panel"><span className="boundary-icon">i</span><div><strong>Designed around responsible use</strong><p>This early interface does not prescribe exercises, assess recovery, analyse camera footage or provide medical advice. Any movement plan or change must come from a qualified healthcare professional.</p></div></section>
      <footer className="site-footer"><span>REFORM <i>·</i> MOVEMENT INFORMATION PLATFORM</span><span>React + Django <b>·</b> AI / camera features not yet integrated</span></footer>
    </main>
  );
}
