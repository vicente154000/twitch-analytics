import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { obtenerAnimePorId, obtenerPersonajesAnime, obtenerImagenesAnime } from "../services/jikan.js";
import { posterAnime, tituloAnime, unirGeneros } from "../utils/anime.js";

export default function DetalleAnime() {
  const { id } = useParams();

  const resultado = useAsync(
    async ({ signal: senal }) => {
      // Hacemos las 3 llamadas en paralelo con Promise.all.
      // Las de personajes e imágenes tienen catch() para que
      // si fallan no tumben toda la página; el detalle principal
      // es lo único realmente necesario.
      const [detalle, personajes, imagenes] = await Promise.all([
        obtenerAnimePorId({ id, senal }),
        obtenerPersonajesAnime({ id, senal }).catch(() => null),
        obtenerImagenesAnime({ id, senal }).catch(() => null),
      ]);
      return { detail: detalle, chars: personajes, pics: imagenes };
    },
    [id],
  );

  if (resultado.status === "loading") return <p className="muted">Cargando detalle…</p>;
  if (resultado.status === "error") return <p className="error">No se pudo cargar el detalle.</p>;

  const anime = resultado.data?.detail?.data;
  if (!anime) return <p className="muted">No encontrado.</p>;

  const titulo = tituloAnime(anime);
  const poster = posterAnime(anime);
  const generos = unirGeneros(anime);
  const puntuacion = anime.score ?? "—";
  const anio = anime.year ?? (anime.aired?.prop?.from?.year ?? "—");
  const episodios = anime.episodes ?? "—";
  const estado = anime.status ?? "—";
  const clasificacion = anime.rating ?? "—";
  const trailer = anime.trailer?.url;

  const personajes = resultado.data?.chars?.data ?? [];
  const imagenes = resultado.data?.pics?.data ?? [];

  return (
    <div className="stack">
      <section className="detailHero" aria-label={titulo}>
        <img className="detailHeroImg" src={poster} alt="" />
        <div className="detailHeroOverlay" aria-hidden="true" />

        <div className="detailHeroInner">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badgeRed">Verified wiki</span>
            <span className="muted" style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {(anime.type ?? "—").toString()} • {anio} • {clasificacion}
            </span>
          </div>

          <h1 className="detailTitle">
            <span style={{ color: "var(--text)" }}>{titulo.split(" ")[0]?.toUpperCase() ?? titulo.toUpperCase()}</span>{" "}
            <span style={{ color: "var(--accent)" }}>
              {titulo.split(" ").slice(1).join(" ").toUpperCase() || ""}
            </span>
          </h1>

          <div className="metaRow" style={{ fontSize: 14 }}>
            <span className="pill">
              <span className="rating">★</span> {puntuacion}
            </span>
            <span className="pill">{episodios} eps</span>
            <span className="pill">{estado}</span>
            {generos ? <span className="pill">{generos}</span> : null}
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

      {personajes.length ? (
        <section aria-label="Main characters">
          <div className="sectionRow">
            <div className="detailSectionTitle">Main Characters</div>
            <span className="linkTiny">SEE ALL</span>
          </div>
          <div className="gridCards" style={{ marginTop: 16 }}>
            {personajes.slice(0, 6).map((personaje) => {
              const img =
                personaje.character?.images?.webp?.image_url ||
                personaje.character?.images?.jpg?.image_url ||
                "";
              const nombre = personaje.character?.name ?? "Character";
              const rol = personaje.role ?? "";
              return (
                <div key={personaje.character?.mal_id ?? nombre} className="cardGridItem">
                  <img src={img} alt={nombre} loading="lazy" />
                  <div className="cardGridBody">
                    <h3 className="cardGridTitle" style={{ marginBottom: 6 }}>
                      {nombre}
                    </h3>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {rol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {imagenes.length ? (
        <section aria-label="Concept Art Gallery">
          <div className="detailSectionTitle">Concept Art Gallery</div>
          <div className="galleryGrid" style={{ marginTop: 16 }}>
            {imagenes.slice(0, 9).map((imagen, indice) => {
              const fuente =
                imagen.jpg?.large_image_url || imagen.webp?.large_image_url || imagen.jpg?.image_url || "";
              return (
                <a
                  key={fuente || indice}
                  href={fuente}
                  target="_blank"
                  rel="noreferrer"
                  className="cardGridItem"
                  aria-label="Abrir imagen"
                >
                  <img src={fuente} alt="" loading="lazy" />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
