import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FondoMarcaAgua } from "../components/FondoMarcaAgua";
import { Logo } from "../components/Logo";
import { NoticiasBar } from "../components/NoticiasBar";
import { useAuth } from "../auth/useAuth";
import { obtenerMiFarmacia } from "../api/farmacias";
import type { Farmacia } from "../types";

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
  const [miFarmacia, setMiFarmacia] = useState<Farmacia | null>(null);

  useEffect(() => {
    if (usuario?.rol !== "farmacia") {
      setMiFarmacia(null);
      return;
    }
    obtenerMiFarmacia()
      .then(setMiFarmacia)
      .catch(() => setMiFarmacia(null));
  }, [usuario?.rol]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <FondoMarcaAgua />
      <div className="app-header-group">
        <header className="app-header">
          <NavLink to="/" className="brand">
            <Logo />
          </NavLink>
          {miFarmacia && (
            <NavLink to="/mi-farmacia" className="app-header-farmacia">
              <span className="app-header-farmacia-nombre">{miFarmacia.nombre}</span>
            </NavLink>
          )}
          <nav>
            {usuario?.rol === "admin" && (
              <>
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/medicamentos" className={navLinkClass}>
                  Medicamentos
                </NavLink>
                <NavLink to="/admin/farmacias" className={navLinkClass}>
                  Farmacias
                </NavLink>
                <NavLink to="/admin/clientes" className={navLinkClass}>
                  Clientes
                </NavLink>
                <NavLink to="/admin/mensajes" className={navLinkClass}>
                  Mensajes
                </NavLink>
              </>
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
        <NoticiasBar />
      </div>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
