import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { searchAnime } from "../services/jikan.js";

const LIMIT = 12;

function getParam(sp, key, fallback = "") {
  return sp.get(key) ?? fallback;
}

export default function AnimeList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = getParam(searchParams, "q", "");
  const type = getParam(searchParams, "type", "");
  const status = getParam(searchParams, "status", "");
  const rating = getParam(searchParams, "rating", "");
  const page = Number(getParam(searchParams, "page", "1")) || 1;

  const [draft, setDraft] = useState(() => ({
    q,
    type,
    status,
    rating,
  }));

  const deps = useMemo(() => [q, type, status, rating, page], [q, type, status, rating, page]);

  const result = useAsync(
    ({ signal }) =>
      searchAnime({
        q: q || undefined,
        type: type || undefined,
        status: status || undefined,
        rating: rating || undefined,
        page,
        limit: LIMIT,
        signal,
      }),
    deps,
  );

  const pagination = result.data?.pagination;
  const hasPrev = Boolean(pagination?.has_previous_page) && page > 1;
  const hasNext = Boolean(pagination?.has_next_page);

  function onSubmit(e) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (draft.q) next.set("q", draft.q);
    if (draft.type) next.set("type", draft.type);
    if (draft.status) next.set("status", draft.status);
    if (draft.rating) next.set("rating", draft.rating);
    next.set("page", "1");
    setSearchParams(next);
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  return (
    <div className="stack">
      <div className="sectionRow">
        <div className="sectionTitleText">FEATURED TITLES</div>
        <span className="muted">Search + filters</span>
      </div>

      <section className="panel" aria-label="Buscador de anime">
        <form onSubmit={onSubmit}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="label" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              className="input"
              value={draft.q}
              placeholder="Search titles, characters, or studios..."
              onChange={(e) => setDraft((s) => ({ ...s, q: e.target.value }))}
            />
          </div>

          <div className="formRow" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div className="field">
              <label className="label" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className="select"
                value={draft.type}
                onChange={(e) => setDraft((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="select"
                value={draft.status}
                onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="airing">Airing</option>
                <option value="complete">Complete</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="toolbar">
            <div className="field" style={{ minWidth: 220 }}>
              <label className="label" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                className="select"
                value={draft.rating}
                onChange={(e) => setDraft((s) => ({ ...s, rating: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="g">G</option>
                <option value="pg">PG</option>
                <option value="pg13">PG-13</option>
                <option value="r17">R - 17+</option>
                <option value="r">R+</option>
                <option value="rx">Rx</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btnPrimary" type="submit">
                Search
              </button>
              <Link className="btn" to="/anime">
                Reset
              </Link>
            </div>
          </div>
        </form>
      </section>

      {result.status === "loading" && <p className="muted">Cargando resultados…</p>}
      {result.status === "error" && (
        <p className="error">Ha ocurrido un error cargando resultados.</p>
      )}

      {result.status === "success" && (
        <>
          {!result.data?.data?.length ? (
            <p className="muted">No hay resultados con estos filtros.</p>
          ) : (
            <div className="gridCards" style={{ marginTop: 14 }}>
              {result.data.data.map((a) => (
                <AnimeCard key={a.mal_id} anime={a} />
              ))}
            </div>
          )}

          <div className="toolbar">
            <Pagination
              page={page}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
            <span className="muted">
              {pagination?.items?.total
                ? `Total aprox: ${pagination.items.total}`
                : "Total no disponible"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

