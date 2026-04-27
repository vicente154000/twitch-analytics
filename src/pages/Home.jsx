import { Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { getSeasonNow, getTopAnime } from "../services/jikan.js";

export default function Home() {
  const top = useAsync(({ signal }) => getTopAnime({ limit: 6, signal }), ["top"]);
  const now = useAsync(({ signal }) => getSeasonNow({ limit: 6, signal }), ["seasonNow"]);

  return (
    <div>
      <section className="hero" aria-label="Presentación">
        <h1>Explora anime con datos reales.</h1>
        <p>
          Landing con secciones de la API (Top y Temporada) + un explorador con búsqueda y un
          detalle completo. Todo en React Router, mobile-first y listo para auditar.
        </p>
        <div className="heroActions">
          <Link to="/anime" className="btn btnPrimary">
            Explorar animes
          </Link>
          <a className="btn" href="https://docs.api.jikan.moe/" target="_blank" rel="noreferrer">
            Docs Jikan
          </a>
        </div>
      </section>

      <div className="sectionHeader">
        <h2>Top Anime</h2>
        <span>Sección basada en API</span>
      </div>
      {top.status === "loading" && <p className="muted">Cargando top…</p>}
      {top.status === "error" && <p className="error">No se pudo cargar el top.</p>}
      {top.status === "success" && (
        <div className="grid">
          {top.data?.data?.map((a) => (
            <AnimeCard key={a.mal_id} anime={a} />
          ))}
        </div>
      )}

      <div className="sectionHeader">
        <h2>Temporada actual</h2>
        <span>Sección basada en API</span>
      </div>
      {now.status === "loading" && <p className="muted">Cargando temporada…</p>}
      {now.status === "error" && <p className="error">No se pudo cargar la temporada actual.</p>}
      {now.status === "success" && (
        <div className="grid">
          {now.data?.data?.map((a) => (
            <AnimeCard key={a.mal_id} anime={a} />
          ))}
        </div>
      )}
    </div>
  );
}

