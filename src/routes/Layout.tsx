import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../auth/useAuth";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

function navLinkCanjesClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-canjes nav-link-active" : "nav-link nav-link-canjes";
}

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand">
          <Logo />
        </NavLink>
        <nav>
          <NavLink to="/medicamentos" className={navLinkClass}>
            Medicamentos
          </NavLink>
          {usuario?.rol === "admin" && (
            <>
              <NavLink to="/admin/farmacias" className={navLinkClass}>
                Farmacias
              </NavLink>
              <NavLink to="/admin/clientes" className={navLinkClass}>
                Clientes
              </NavLink>
            </>
          )}
          {usuario?.rol === "farmacia" && (
            <NavLink to="/mi-farmacia" className={navLinkClass}>
              Mi farmacia
            </NavLink>
          )}
          {usuario && (
            <NavLink to="/canjes" className={navLinkCanjesClass}>
              <i className="bi bi-gift" aria-hidden="true" /> Canjes
            </NavLink>
          )}
        </nav>
        <div className="app-header-user">
          {usuario ? (
            <>
              <span className="app-header-email">{usuario.email}</span>
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-link">
              Ingresar
            </NavLink>
          )}
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
