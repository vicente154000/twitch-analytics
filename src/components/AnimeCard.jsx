import { Link } from "react-router-dom";

function pickImage(images) {
  return (
    images?.webp?.large_image_url ||
    images?.jpg?.large_image_url ||
    images?.webp?.image_url ||
    images?.jpg?.image_url ||
    ""
  );
}

export default function AnimeCard({ anime }) {
  const img = pickImage(anime.images);
  const title = anime.title ?? anime.title_english ?? anime.title_japanese ?? "Anime";
  const score = anime.score ?? "—";
  const year = anime.year ?? (anime.aired?.prop?.from?.year ?? "—");
  const type = anime.type ?? "—";

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="cardGridItem"
      aria-label={`Ver detalles de ${title}`}
    >
      <img src={img} alt={`Poster de ${title}`} loading="lazy" />
      <div className="cardGridBody">
        <h3 className="cardGridTitle">{title}</h3>
        <div className="metaRow">
          <span className="pill">
            <span className="rating">★</span> {score}
          </span>
          <span className="pill">{type}</span>
          <span className="pill">{year}</span>
        </div>
      </div>
    </Link>
  );
}

