const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

function buildUrl(path, params) {
  const url = new URL(`${JIKAN_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url;
}

async function jikanGet(path, { params, signal } = {}) {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`Jikan error ${res.status} ${res.statusText}${details ? ` - ${details}` : ""}`);
  }

  return res.json();
}

export async function getTopAnime({ page = 1, limit = 12, signal } = {}) {
  return jikanGet("/top/anime", { params: { page, limit }, signal });
}

export async function getSeasonNow({ page = 1, limit = 12, signal } = {}) {
  return jikanGet("/seasons/now", { params: { page, limit }, signal });
}

export async function searchAnime({
  q,
  page = 1,
  limit = 12,
  type,
  status,
  rating,
  order_by = "score",
  sort = "desc",
  signal,
} = {}) {
  return jikanGet("/anime", {
    params: { q, page, limit, type, status, rating, order_by, sort },
    signal,
  });
}

export async function getAnimeById({ id, signal } = {}) {
  return jikanGet(`/anime/${id}/full`, { signal });
}

export async function getAnimeCharacters({ id, signal } = {}) {
  return jikanGet(`/anime/${id}/characters`, { signal });
}

export async function getAnimePictures({ id, signal } = {}) {
  return jikanGet(`/anime/${id}/pictures`, { signal });
}

