import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import logoImg from "../assets/logo-no-alto.png";

export function HomePage() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;

  if (usuario?.rol === "admin") return <Navigate to="/admin/farmacias" replace />;
  if (usuario?.rol === "farmacia") return <Navigate to="/mi-farmacia" replace />;

  return (
    <div className="hero">
      <div className="hero-logo-wrap">
        <img src={logoImg} alt="vmg" className="hero-logo" />
      </div>
      <h1 className="hero-title">Plan Paciente</h1>
      <p className="hero-subtitle">Programa de planes promocionales para farmacias.</p>
      <div className="actions hero-actions">
        <Link to="/login" className="btn-cta">
          Iniciar sesión
        </Link>
        <Link to="/registro" className="btn-cta btn-cta-secondary">
          Registrar mi farmacia
        </Link>
      </div>
    </div>
  );
}
