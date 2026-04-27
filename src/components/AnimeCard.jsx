import { Link } from "react-router-dom";

function elegirImagen(imagenes) {
  return (
    imagenes?.webp?.large_image_url ||
    imagenes?.jpg?.large_image_url ||
    imagenes?.webp?.image_url ||
    imagenes?.jpg?.image_url ||
    ""
  );
}

export default function TarjetaAnime({ anime }) {
  const img = elegirImagen(anime.images);
  const titulo = anime.title ?? anime.title_english ?? anime.title_japanese ?? "Anime";
  const puntuacion = anime.score ?? "—";
  const anio = anime.year ?? (anime.aired?.prop?.from?.year ?? "—");
  const tipo = anime.type ?? "—";

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="cardGridItem"
      aria-label={`Ver detalles de ${titulo}`}
    >
      <img src={img} alt={`Poster de ${titulo}`} loading="lazy" />
      <div className="cardGridBody">
        <h3 className="cardGridTitle">{titulo}</h3>
        <div className="metaRow">
          <span className="pill">
            <span className="rating">★</span> {puntuacion}
          </span>
          <span className="pill">{tipo}</span>
          <span className="pill">{anio}</span>
        </div>
      </div>
    </Link>
  );
}
