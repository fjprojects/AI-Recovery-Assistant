import { useEffect, useMemo, useState } from "react";
import { getJson } from "./lib/api.js";
import {
  filterExerciseReferences,
  readSavedReferences,
  toggleSavedReference,
  writeSavedReferences,
} from "./lib/catalogue.js";

const iconFor = (category = "") => {
  const value = category.toLowerCase();
  if (value.includes("upper")) return "↗";
  if (value.includes("lower")) return "⌁";
  if (value.includes("ankle")) return "◌";
  return "✳";
};

function getSessionStore() {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export default function App() {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [reviewList, setReviewList] = useState(() => readSavedReferences(getSessionStore()));

  async function loadLibrary() {
    setStatus("loading");
    setError("");
    try {
      const [health, data, categoryData] = await Promise.all([
        getJson("/api/health/"),
        getJson("/api/exercises/?page_size=100"),
        getJson("/api/exercises/categories/").catch(() => null),
      ]);
      if (health.status !== "ok") throw new Error("The movement-library health check did not pass.");

      const items = Array.isArray(data.items) ? data.items : [];
      const discovered = categoryData?.categories ?? items.map((item) => item.category);
      setExercises(items);
      setCategories(["All", ...[...new Set(discovered.filter(Boolean))].sort((a, b) => a.localeCompare(b))]);
      setSelectedId((current) => items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Unable to load the movement library.");
      setStatus("error");
    }
  }

  useEffect(() => { loadLibrary(); }, []);
  useEffect(() => {
    writeSavedReferences(getSessionStore(), reviewList);
  }, [reviewList]);

  const visibleExercises = useMemo(
    () => filterExerciseReferences(exercises, {
      category,
      query,
      savedIds: reviewList,
      savedOnly,
      sort,
    }),
    [exercises, category, query, reviewList, savedOnly, sort],
  );
  const selected = visibleExercises.find((item) => item.id === selectedId) ?? visibleExercises[0] ?? null;
  const detail = selectedDetail?.id === selected?.id ? selectedDetail : selected;
  const saved = selected ? reviewList.includes(selected.id) : false;

  useEffect(() => {
    if (!selected?.id) {
      setSelectedDetail(null);
      setDetailStatus("idle");
      return undefined;
    }
    let active = true;
    const fallback = selected;
    setSelectedDetail(fallback);
    setDetailStatus("loading");
    getJson(`/api/exercises/${encodeURIComponent(selected.id)}/`)
      .then((payload) => {
        if (active && payload.item?.id === selected.id) {
          setSelectedDetail(payload.item);
          setDetailStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setSelectedDetail(fallback);
          setDetailStatus("fallback");
        }
      });
    return () => { active = false; };
  }, [selected?.id]);

  function toggleReview(id) {
    setReviewList((current) => toggleSavedReference(current, id));
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSavedOnly(false);
    setSort("default");
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
        <article className="summary-card"><span className="summary-icon">◈</span><div><strong>{Math.max(0, categories.length - 1)}</strong><small>Movement categories</small></div></article>
        <article className="summary-card"><span className="summary-icon">☆</span><div><strong>{reviewList.length.toString().padStart(2, "0")}</strong><small>Saved for discussion</small></div></article>
        <article className="summary-card summary-note"><span className="status-dot" /><div><strong>Concept build</strong><small>AI or camera analysis is not integrated</small></div></article>
      </section>

      <section className="library-section">
        <div className="section-heading">
          <div><p className="eyebrow">EXPLORE THE LIBRARY</p><h2>Movement references</h2><p className="section-subtitle">Browse the illustrative entries supplied by the Django API.</p></div>
          <span className="entry-count">{visibleExercises.length} of {exercises.length} entries</span>
        </div>
        <div className="library-toolbar">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, category or guidance…" aria-label="Search movement library" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
          <div className="category-filters" aria-label="Filter by category">{categories.map((item) => <button type="button" key={item} className={category === item ? "filter-chip active" : "filter-chip"} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
        </div>
        <div className="library-controls">
          <label className="library-sort"><span>SORT</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="default">Recommended order</option><option value="name">Name A–Z</option><option value="category">Category</option></select></label>
          <button type="button" className={savedOnly ? "saved-filter active" : "saved-filter"} onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly}>☆ Saved only ({reviewList.length})</button>
          <button type="button" className="text-button" onClick={clearFilters}>Reset filters</button>
        </div>

        {status === "loading" && <div className="state-card">Loading the movement library…</div>}
        {status === "error" && <div className="state-card error-state"><strong>The movement library is unavailable.</strong><p>{error}</p><button className="outline-button" onClick={loadLibrary}>Try again</button></div>}
        {status === "ready" && visibleExercises.length === 0 && <div className="state-card"><strong>{savedOnly && reviewList.length === 0 ? "No saved references yet" : "No matching entries"}</strong><p>{savedOnly && reviewList.length === 0 ? "Save an entry to keep it in your discussion list for this browser session." : "Try another search or category."}</p><button className="text-button" onClick={clearFilters}>Clear filters</button></div>}

        <div className="library-layout">
          <div className="exercise-grid">
            {visibleExercises.map((item, index) => (
              <button type="button" key={item.id} className={selected?.id === item.id ? "exercise-card active" : "exercise-card"} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id}>
                <div className="exercise-card-top"><span className={`exercise-icon icon-${index % 3}`}>{iconFor(item.category)}</span><span className="card-arrow">{reviewList.includes(item.id) ? "★" : "↗"}</span></div>
                <span className="category-label">{item.category}</span>
                <strong>{item.name}</strong>
                <span className="card-description">{item.description}</span>
                <span className="card-bottom">View reference <span>→</span></span>
              </button>
            ))}
          </div>

          <aside className="detail-panel">
            <div className="detail-panel-head"><p className="eyebrow">REFERENCE DETAIL</p><span className="detail-badge">{detailStatus === "loading" ? "LOADING" : "INFORMATION ONLY"}</span></div>
            {detail ? <>
              <div className="detail-icon">{iconFor(detail.category)}</div>
              <span className="category-label">{detail.category}</span>
              <h3>{detail.name}</h3>
              <p className="detail-copy">{detail.description}</p>
              <div className="professional-note"><strong>Professional guidance</strong><p>{detail.professional_note}</p></div>
              <button type="button" className={saved ? "save-button saved" : "save-button"} onClick={() => toggleReview(detail.id)} aria-pressed={saved}>{saved ? "✓ Saved for discussion" : "＋ Save for discussion"}</button>
              <p className="privacy-note">Only reference IDs are remembered in this browser session. No personal or health information is collected.</p>
            </> : <div className="empty-detail">Select a library entry to view its details.</div>}
          </aside>
        </div>
      </section>

      <section className="boundary-panel"><span className="boundary-icon">i</span><div><strong>Designed around responsible use</strong><p>This early interface does not prescribe exercises, assess recovery, analyse camera footage or provide medical advice. Any movement plan or change must come from a qualified healthcare professional.</p></div></section>
      <footer className="site-footer"><span>REFORM <i>·</i> MOVEMENT INFORMATION PLATFORM</span><span>React + Django <b>·</b> AI / camera features not yet integrated</span></footer>
    </main>
  );
}
