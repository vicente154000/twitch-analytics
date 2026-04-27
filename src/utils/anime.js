export function tituloAnime(anime) {
  return anime?.title ?? anime?.title_english ?? anime?.title_japanese ?? "Anime";
}

export function posterAnime(anime) {
  const imagenes = anime?.images;
  return (
    imagenes?.webp?.large_image_url ||
    imagenes?.jpg?.large_image_url ||
    imagenes?.webp?.image_url ||
    imagenes?.jpg?.image_url ||
    ""
  );
}

export function unirGeneros(anime) {
  const generos = anime?.genres ?? [];
  return generos.map((g) => g.name).filter(Boolean).join(", ");
}
