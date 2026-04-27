export default function Paginacion({ pagina, tieneAnterior, tieneSiguiente, alAnterior, alSiguiente }) {
  return (
    <div className="pagination" role="navigation" aria-label="Paginación">
      <button className="btn" type="button" onClick={alAnterior} disabled={!tieneAnterior}>
        ← Anterior
      </button>
      <span className="muted">Página {pagina}</span>
      <button className="btn" type="button" onClick={alSiguiente} disabled={!tieneSiguiente}>
        Siguiente →
      </button>
    </div>
  );
}
