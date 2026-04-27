import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { getAnimeById, getAnimeCharacters, getAnimePictures } from "../services/jikan.js";
import { animePoster, animeTitle, joinGenres } from "../utils/anime.js";

export default function AnimeDetail() {
  const { id } = useParams();

  const result = useAsync(
    async ({ signal }) => {
      const [detail, chars, pics] = await Promise.all([
        getAnimeById({ id, signal }),
        getAnimeCharacters({ id, signal }).catch(() => null),
        getAnimePictures({ id, signal }).catch(() => null),
      ]);
      return { detail, chars, pics };
    },
    [id],
  );

  if (result.status === "loading") return <p className="muted">Cargando detalle…</p>;
  if (result.status === "error") return <p className="error">No se pudo cargar el detalle.</p>;

  const anime = result.data?.detail?.data;
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

  const characters = result.data?.chars?.data ?? [];
  const pictures = result.data?.pics?.data ?? [];

  return (
    <div className="stack">
      <section className="detailHero" aria-label={title}>
        <img className="detailHeroImg" src={poster} alt="" />
        <div className="detailHeroOverlay" aria-hidden="true" />

        <div className="detailHeroInner">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badgeRed">Verified wiki</span>
            <span className="muted" style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {(anime.type ?? "—").toString()} • {year} • {rating}
            </span>
          </div>

          <h1 className="detailTitle">
            <span style={{ color: "var(--text)" }}>{title.split(" ")[0]?.toUpperCase() ?? title.toUpperCase()}</span>{" "}
            <span style={{ color: "var(--accent)" }}>
              {title.split(" ").slice(1).join(" ").toUpperCase() || ""}
            </span>
          </h1>

          <div className="metaRow" style={{ fontSize: 14 }}>
            <span className="pill">
              <span className="rating">★</span> {score}
            </span>
            <span className="pill">{episodes} eps</span>
            <span className="pill">{status}</span>
            {genres ? <span className="pill">{genres}</span> : null}
          </div>

          <div className="heroActions">
            <Link to="/anime" className="btn">
              ← Back
            </Link>
            {anime.url ? (
              <a className="btn btnPrimary" href={anime.url} target="_blank" rel="noreferrer">
                Read More
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

      <section className="panel" aria-label="Synopsis">
        <div className="detailSectionTitle" style={{ marginBottom: 12 }}>
          Synopsis
        </div>
        <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
          {anime.synopsis || "Sin sinopsis disponible."}
        </p>
      </section>

      {characters.length ? (
        <section aria-label="Main characters">
          <div className="sectionRow">
            <div className="detailSectionTitle">Main Characters</div>
            <span className="linkTiny">SEE ALL</span>
          </div>
          <div className="gridCards" style={{ marginTop: 16 }}>
            {characters.slice(0, 6).map((c) => {
              const img =
                c.character?.images?.webp?.image_url ||
                c.character?.images?.jpg?.image_url ||
                "";
              const name = c.character?.name ?? "Character";
              const role = c.role ?? "";
              return (
                <div key={c.character?.mal_id ?? name} className="cardGridItem">
                  <img src={img} alt={name} loading="lazy" />
                  <div className="cardGridBody">
                    <h3 className="cardGridTitle" style={{ marginBottom: 6 }}>
                      {name}
                    </h3>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {pictures.length ? (
        <section aria-label="Concept Art Gallery">
          <div className="detailSectionTitle">Concept Art Gallery</div>
          <div className="galleryGrid" style={{ marginTop: 16 }}>
            {pictures.slice(0, 9).map((p, idx) => {
              const src =
                p.jpg?.large_image_url || p.webp?.large_image_url || p.jpg?.image_url || "";
              return (
                <a
                  key={src || idx}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="cardGridItem"
                  aria-label="Abrir imagen"
                >
                  <img src={src} alt="" loading="lazy" />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

