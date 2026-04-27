import { Link, useNavigate } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { getSeasonNow, getTopAnime } from "../services/jikan.js";

function titleFor(anime) {
  return anime?.title ?? anime?.title_english ?? anime?.title_japanese ?? "Anime";
}

function posterFor(anime) {
  const images = anime?.images;
  return (
    images?.webp?.large_image_url ||
    images?.jpg?.large_image_url ||
    images?.webp?.image_url ||
    images?.jpg?.image_url ||
    ""
  );
}

export default function Home() {
  const top = useAsync(({ signal }) => getTopAnime({ limit: 6, signal }), ["top"]);
  const now = useAsync(({ signal }) => getSeasonNow({ limit: 6, signal }), ["seasonNow"]);
  const navigate = useNavigate();

  const hero = top.data?.data?.[0];
  const mini = top.data?.data?.[1];
  const carousel = now.data?.data ?? [];

  return (
    <div className="stack">
      <section aria-label="Buscador">
        <div className="searchInputWrap">
          <span className="searchIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.7 16.7 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            className="searchInput"
            placeholder="Search titles, characters, or studios..."
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const q = e.currentTarget.value.trim();
              navigate(q ? `/anime?q=${encodeURIComponent(q)}` : "/anime");
            }}
          />
        </div>

        <div className="chipRow" aria-label="Categorías" style={{ marginTop: 24 }}>
          <span className="chip">ACTION</span>
          <span className="chip">SCI-FI</span>
          <span className="chip">SEINEN</span>
          <span className="chip">CYBERPUNK</span>
          <span className="chip">CLASSIC</span>
        </div>
      </section>

      <section aria-label="Trending">
        <div className="sectionTitle">
          <span className="sectionTitleBar" aria-hidden="true" />
          <span className="sectionTitleText">TRENDING NOW</span>
        </div>

        {top.status === "loading" && <p className="muted">Cargando trending…</p>}
        {top.status === "error" && <p className="error">No se pudo cargar trending.</p>}

        {top.status === "success" && hero && (
          <div className="featuredGrid" style={{ marginTop: 32 }}>
            <article className="heroCard" aria-label="Featured entry">
              <div className="heroMedia" aria-hidden="true">
                <img src={posterFor(hero)} alt="" loading="lazy" />
              </div>
              <div className="heroGradient" aria-hidden="true" />
              <div className="heroInner">
                <div className="kicker">FEATURED ENTRY</div>
                <h2 className="heroHeading">{titleFor(hero).toUpperCase()}</h2>
                <div className="heroActions">
                  <Link to={`/anime/${hero.mal_id}`} className="btn btnPrimary">
                    VIEW DETAILS
                  </Link>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => navigate(`/anime?q=${encodeURIComponent(titleFor(hero))}`)}
                  >
                    CHARACTER LIST
                  </button>
                </div>
              </div>
            </article>

            {mini ? (
              <Link to={`/anime/${mini.mal_id}`} className="miniCard" aria-label="Trending item">
                <div className="heroMedia" aria-hidden="true">
                  <img src={posterFor(mini)} alt="" loading="lazy" />
                </div>
                <div className="miniTitle">{titleFor(mini).toUpperCase()}</div>
              </Link>
            ) : null}
          </div>
        )}
      </section>

      <section aria-label="Featured titles">
        <div className="sectionRow">
          <div className="sectionTitleText">FEATURED TITLES</div>
          <Link className="linkTiny" to="/anime">
            EXPLORE ALL
          </Link>
        </div>

        {now.status === "loading" && <p className="muted">Cargando…</p>}
        {now.status === "error" && <p className="error">No se pudo cargar featured.</p>}

        {now.status === "success" && (
          <div className="carousel" aria-label="Carrusel de títulos" style={{ marginTop: 16 }}>
            {carousel.map((a) => (
              <Link key={a.mal_id} to={`/anime/${a.mal_id}`} className="posterCard">
                <img src={posterFor(a)} alt={titleFor(a)} loading="lazy" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Discover by genre">
        <div className="sectionTitleText">DISCOVER BY GENRE</div>
        <div className="genreGrid" style={{ marginTop: 32 }}>
          {["SHONEN", "HORROR", "MECHA", "ISEKAI", "SLICE OF LIFE", "SPORTS"].map((g) => (
            <button
              key={g}
              type="button"
              className="genreTile"
              onClick={() => navigate(`/anime?q=${encodeURIComponent(g)}`)}
            >
              {g}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

