import { Link, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../auth/useAuth";

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
        <Link to="/" className="brand">
          <Logo />
        </Link>
        <nav>
          <Link to="/medicamentos">Medicamentos</Link>
          {usuario && <Link to="/canjes">Canjes</Link>}
          {usuario && <Link to="/atender-cliente">Atender cliente</Link>}
          {usuario?.rol === "admin" && (
            <>
              <Link to="/admin/farmacias">Farmacias</Link>
              <Link to="/admin/clientes">Clientes</Link>
            </>
          )}
          {usuario?.rol === "farmacia" && <Link to="/mi-farmacia">Mi farmacia</Link>}
        </nav>
        <div className="app-header-user">
          {usuario ? (
            <>
              <span>{usuario.email}</span>
              <button type="button" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login">Ingresar</Link>
          )}
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
