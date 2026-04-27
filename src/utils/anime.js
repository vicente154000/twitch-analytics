export function animeTitle(anime) {
  return anime?.title ?? anime?.title_english ?? anime?.title_japanese ?? "Anime";
}

export function animePoster(anime) {
  const images = anime?.images;
  return (
    images?.webp?.large_image_url ||
    images?.jpg?.large_image_url ||
    images?.webp?.image_url ||
    images?.jpg?.image_url ||
    ""
  );
}

export function joinGenres(anime) {
  const genres = anime?.genres ?? [];
  return genres.map((g) => g.name).filter(Boolean).join(", ");
}

