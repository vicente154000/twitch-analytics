import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { getAnimeById } from "../services/jikan.js";
import { animePoster, animeTitle, joinGenres } from "../utils/anime.js";

export default function AnimeDetail() {
  const { id } = useParams();

  const result = useAsync(({ signal }) => getAnimeById({ id, signal }), [id]);

  if (result.status === "loading") return <p className="muted">Cargando detalle…</p>;
  if (result.status === "error") return <p className="error">No se pudo cargar el detalle.</p>;

  const anime = result.data?.data;
  if (!anime) return <p className="muted">No encontrado.</p>;

  const title = animeTitle(anime);
  const poster = animePoster(anime);
  const genres = joinGenres(anime);
  const score = anime.score ?? "—";
  const year = anime.year ?? (anime.aired?.prop?.from?.year ?? "—");
  const episodes = anime.episodes ?? "—";
  const status = anime.status ?? "—";
  const rating = anime.rating ?? "—";
  const trailer = anime.trailer?.url;

  return (
    <div className="detail">
      <div className="sectionHeader">
        <h2>Detalle</h2>
        <span>
          <Link to="/anime" className="muted">
            ← Volver a explorar
          </Link>
        </span>
      </div>

      <section className="panel detailTop" aria-label={`Detalle de ${title}`}>
        <img className="detailPoster" src={poster} alt={`Poster de ${title}`} />

        <div>
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h1>
          <div className="cardMeta" style={{ marginBottom: 10 }}>
            <span className="pill">
              <span className="rating">★</span> {score}
            </span>
            <span className="pill">{anime.type ?? "—"}</span>
            <span className="pill">{year}</span>
            <span className="pill">{episodes} eps</span>
          </div>
          <div className="cardMeta" style={{ marginBottom: 14 }}>
            <span className="pill">{status}</span>
            <span className="pill">{rating}</span>
            {genres ? <span className="pill">{genres}</span> : null}
          </div>

          {anime.synopsis ? (
            <p style={{ lineHeight: 1.6, marginTop: 0 }} className="muted">
              {anime.synopsis}
            </p>
          ) : (
            <p className="muted">Sin sinopsis disponible.</p>
          )}

          <div className="heroActions">
            {anime.url ? (
              <a className="btn btnPrimary" href={anime.url} target="_blank" rel="noreferrer">
                Ver en MyAnimeList
              </a>
            ) : null}
            {trailer ? (
              <a className="btn" href={trailer} target="_blank" rel="noreferrer">
                Trailer
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

