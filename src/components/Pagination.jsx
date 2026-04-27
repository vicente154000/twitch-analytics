export default function Pagination({ page, hasPrev, hasNext, onPrev, onNext }) {
  return (
    <div className="pagination" role="navigation" aria-label="Paginación">
      <button className="btn" type="button" onClick={onPrev} disabled={!hasPrev}>
        ← Anterior
      </button>
      <span className="muted">Página {page}</span>
      <button className="btn" type="button" onClick={onNext} disabled={!hasNext}>
        Siguiente →
      </button>
    </div>
  );
}

