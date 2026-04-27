import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <header className="header">
        <div className="container headerInner">
          <div className="brand">
            <span>Kebab Anime</span>
            <span className="badge">Jikan API</span>
          </div>
          <nav className="nav" aria-label="Navegación principal">
            <NavLink to="/" end>
              Inicio
            </NavLink>
            <NavLink to="/anime">Explorar</NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <span>
            Datos por cortesía de Jikan (MyAnimeList). Proyecto hecho por el equipo Kebab.
          </span>
        </div>
      </footer>
    </>
  );
}

