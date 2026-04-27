import { NavLink, Outlet } from "react-router-dom";

function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

export default function Layout() {
  return (
    <>
      <div className="appShell">
        <div className="appFrame">
          <header className="topBar" role="banner">
            <NavLink to="/" className="topBrand" aria-label="Ir a inicio">
              <span className="topBrandMark">N</span>
              <span className="topBrandText">NEOANIME</span>
            </NavLink>

            <NavLink to="/anime" className="topAction" aria-label="Buscar y explorar">
              <Icon>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16.7 16.7 21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Icon>
            </NavLink>
          </header>

          <main className="appContent" role="main">
            <Outlet />
          </main>

          <nav className="bottomNavWrap" aria-label="Navegación inferior">
            <div className="bottomNav">
              <NavLink to="/" end className="bottomNavItem">
                <Icon>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Icon>
                <span>HOME</span>
              </NavLink>

              <NavLink to="/anime" className="bottomNavItem">
                <Icon>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16M4 12h16M4 17h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Icon>
                <span>BROWSE</span>
              </NavLink>

              <NavLink to="/anime" className="bottomNavItem">
                <Icon>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 4h12v17l-6-3-6 3V4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Icon>
                <span>LIBRARY</span>
              </NavLink>

              <NavLink to="/anime" className="bottomNavItem">
                <Icon>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M4 21a8 8 0 0 1 16 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Icon>
                <span>PROFILE</span>
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

