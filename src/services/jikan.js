const URL_BASE_JIKAN = "https://api.jikan.moe/v4";

function construirUrl(ruta, parametros) {
  const url = new URL(`${URL_BASE_JIKAN}${ruta}`);
  if (parametros) {
    for (const [clave, valor] of Object.entries(parametros)) {
      if (valor === undefined || valor === null || valor === "") continue;
      url.searchParams.set(clave, String(valor));
    }
  }
  return url;
}

async function obtenerJikan(ruta, { params: parametros, signal: senal } = {}) {
  const url = construirUrl(ruta, parametros);
  const respuesta = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: senal,
  });

  if (!respuesta.ok) {
    let detalles = "";
    try {
      detalles = await respuesta.text();
    } catch {
      // ignorar errores al leer el cuerpo de la respuesta
    }
    throw new Error(`Jikan error ${respuesta.status} ${respuesta.statusText}${detalles ? ` - ${detalles}` : ""}`);
  }

  return respuesta.json();
}

export async function obtenerTopAnime({ page: pagina = 1, limit: limite = 12, signal: senal } = {}) {
  return obtenerJikan("/top/anime", { params: { page: pagina, limit: limite }, signal: senal });
}

export async function obtenerTemporadaActual({ page: pagina = 1, limit: limite = 12, signal: senal } = {}) {
  return obtenerJikan("/seasons/now", { params: { page: pagina, limit: limite }, signal: senal });
}

export async function buscarAnime({
  q: consulta,
  page: pagina = 1,
  limit: limite = 12,
  type: tipo,
  status: estado,
  rating: clasificacion,
  order_by: ordenarPor = "score",
  sort: orden = "desc",
  signal: senal,
} = {}) {
  return obtenerJikan("/anime", {
    params: { q: consulta, page: pagina, limit: limite, type: tipo, status: estado, rating: clasificacion, order_by: ordenarPor, sort: orden },
    signal: senal,
  });
}

export async function obtenerAnimePorId({ id, signal: senal } = {}) {
  return obtenerJikan(`/anime/${id}/full`, { signal: senal });
}

export async function obtenerPersonajesAnime({ id, signal: senal } = {}) {
  return obtenerJikan(`/anime/${id}/characters`, { signal: senal });
}

export async function obtenerImagenesAnime({ id, signal: senal } = {}) {
  return obtenerJikan(`/anime/${id}/pictures`, { signal: senal });
}
