import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Rol } from "../types";

export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequireRole({ rol }: { rol: Rol | Rol[] }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando…</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  const rolesPermitidos = Array.isArray(rol) ? rol : [rol];
  if (!rolesPermitidos.includes(usuario.rol)) return <Navigate to="/" replace />;

  return <Outlet />;
}
