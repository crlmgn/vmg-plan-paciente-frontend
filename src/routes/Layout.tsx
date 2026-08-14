import { useState } from "react";
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
  const [menuAbierto, setMenuAbierto] = useState(false);

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
            <div className="user-menu">
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setMenuAbierto((v) => !v)}
              >
                <span className="app-header-email">{usuario.email}</span>
                <i
                  className={menuAbierto ? "bi bi-chevron-up" : "bi bi-chevron-down"}
                  aria-hidden="true"
                />
              </button>
              {menuAbierto && (
                <div className="user-menu-dropdown">
                  {usuario.rol === "admin" && (
                    <NavLink
                      to="/admin/configuracion"
                      className="user-menu-item"
                      onClick={() => setMenuAbierto(false)}
                    >
                      <i className="bi bi-gear" aria-hidden="true" /> Configuración
                    </NavLink>
                  )}
                  <button type="button" className="user-menu-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" /> Salir
                  </button>
                </div>
              )}
            </div>
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
