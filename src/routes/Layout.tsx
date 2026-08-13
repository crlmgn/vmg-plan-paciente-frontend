import { Link, Outlet, useNavigate } from "react-router-dom";
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
          Plan Paciente
        </Link>
        <nav>
          <Link to="/medicamentos">Medicamentos</Link>
          {usuario?.rol === "admin" && <Link to="/admin/farmacias">Farmacias</Link>}
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
