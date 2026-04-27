import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TarjetaAnime from "../components/AnimeCard.jsx";
import Paginacion from "../components/Pagination.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { buscarAnime } from "../services/jikan.js";

const LIMITE = 12;

function obtenerParam(parametrosUrl, clave, valorDefecto = "") {
  return parametrosUrl.get(clave) ?? valorDefecto;
}

export default function ListaAnime() {
  const [parametrosBusqueda, establecerParametrosBusqueda] = useSearchParams();

  const consulta = obtenerParam(parametrosBusqueda, "q", "");
  const tipo = obtenerParam(parametrosBusqueda, "type", "");
  const estado = obtenerParam(parametrosBusqueda, "status", "");
  const clasificacion = obtenerParam(parametrosBusqueda, "rating", "");
  const pagina = Number(obtenerParam(parametrosBusqueda, "page", "1")) || 1;

  // Usamos un "borrador" local para el formulario y solo
  // actualizamos la URL al enviar. Así evitamos que cada
  // pulsación de tecla genere entradas en el historial.
  const [borrador, setBorrador] = useState(() => ({
    consulta,
    tipo,
    estado,
    clasificacion,
  }));

  const deps = useMemo(
    () => [consulta, tipo, estado, clasificacion, pagina],
    [consulta, tipo, estado, clasificacion, pagina],
  );

  const resultado = useAsync(
    ({ signal }) =>
      buscarAnime({
        q: consulta || undefined,
        type: tipo || undefined,
        status: estado || undefined,
        rating: clasificacion || undefined,
        page: pagina,
        limit: LIMITE,
        signal,
      }),
    deps,
  );

  const paginacion = resultado.data?.pagination;
  const tieneAnterior = Boolean(paginacion?.has_previous_page) && pagina > 1;
  const tieneSiguiente = Boolean(paginacion?.has_next_page);

  function alEnviar(evento) {
    evento.preventDefault();
    const siguientes = new URLSearchParams();
    if (borrador.consulta) siguientes.set("q", borrador.consulta);
    if (borrador.tipo) siguientes.set("type", borrador.tipo);
    if (borrador.estado) siguientes.set("status", borrador.estado);
    if (borrador.clasificacion) siguientes.set("rating", borrador.clasificacion);
    siguientes.set("page", "1");
    establecerParametrosBusqueda(siguientes);
  }

  function establecerPagina(siguientePagina) {
    const siguientes = new URLSearchParams(parametrosBusqueda);
    siguientes.set("page", String(siguientePagina));
    establecerParametrosBusqueda(siguientes);
  }

  return (
    <div className="stack">
      <div className="sectionRow">
        <div className="sectionTitleText">FEATURED TITLES</div>
        <span className="muted">Search + filters</span>
      </div>

      <section className="panel" aria-label="Buscador de anime">
        <form onSubmit={alEnviar}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="label" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              className="input"
              value={borrador.consulta}
              placeholder="Search titles, characters, or studios..."
              onChange={(e) => setBorrador((s) => ({ ...s, consulta: e.target.value }))}
            />
          </div>

          <div className="formRow" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div className="field">
              <label className="label" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className="select"
                value={borrador.tipo}
                onChange={(e) => setBorrador((s) => ({ ...s, tipo: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="select"
                value={borrador.estado}
                onChange={(e) => setBorrador((s) => ({ ...s, estado: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="airing">Airing</option>
                <option value="complete">Complete</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="toolbar">
            <div className="field" style={{ minWidth: 220 }}>
              <label className="label" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                className="select"
                value={borrador.clasificacion}
                onChange={(e) => setBorrador((s) => ({ ...s, clasificacion: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="g">G</option>
                <option value="pg">PG</option>
                <option value="pg13">PG-13</option>
                <option value="r17">R - 17+</option>
                <option value="r">R+</option>
                <option value="rx">Rx</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btnPrimary" type="submit">
                Search
              </button>
              <Link className="btn" to="/anime">
                Reset
              </Link>
            </div>
          </div>
        </form>
      </section>

      {resultado.status === "loading" && <p className="muted">Cargando resultados…</p>}
      {resultado.status === "error" && (
        <p className="error">Ha ocurrido un error cargando resultados.</p>
      )}

      {resultado.status === "success" && (
        <>
          {!resultado.data?.data?.length ? (
            <p className="muted">No hay resultados con estos filtros.</p>
          ) : (
            <div className="gridCards" style={{ marginTop: 14 }}>
              {resultado.data.data.map((anime) => (
                <TarjetaAnime key={anime.mal_id} anime={anime} />
              ))}
            </div>
          )}

          <div className="toolbar">
            <Paginacion
              pagina={pagina}
              tieneAnterior={tieneAnterior}
              tieneSiguiente={tieneSiguiente}
              alAnterior={() => establecerPagina(pagina - 1)}
              alSiguiente={() => establecerPagina(pagina + 1)}
            />
            <span className="muted">
              {paginacion?.items?.total
                ? `Total aprox: ${paginacion.items.total}`
                : "Total no disponible"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
