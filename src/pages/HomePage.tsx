import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function HomePage() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;

  if (usuario?.rol === "admin") return <Navigate to="/admin/farmacias" replace />;
  if (usuario?.rol === "farmacia") return <Navigate to="/mi-farmacia" replace />;

  return (
    <div className="card">
      <h1>Plan Paciente</h1>
      <p>Programa de planes promocionales para farmacias.</p>
      <div className="actions">
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/registro">Registrar mi farmacia</Link>
      </div>
    </div>
  );
}
