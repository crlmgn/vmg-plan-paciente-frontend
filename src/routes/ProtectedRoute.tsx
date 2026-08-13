import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Rol } from "../types";

export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequireRole({ rol }: { rol: Rol }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to="/" replace />;

  return <Outlet />;
}
