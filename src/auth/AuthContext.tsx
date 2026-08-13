import { useCallback, useEffect, useState, type ReactNode } from "react";
import { login as loginRequest, obtenerUsuarioActual } from "../api/auth";
import { setOnSessionExpired } from "../api/client";
import { clearTokens, getAccessToken, setTokens } from "../api/tokens";
import type { Usuario } from "../types";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const logout = useCallback(() => {
    clearTokens();
    setUsuario(null);
  }, []);

  useEffect(() => {
    setOnSessionExpired(logout);
  }, [logout]);

  useEffect(() => {
    if (!getAccessToken()) {
      setCargando(false);
      return;
    }
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => clearTokens())
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const respuesta = await loginRequest(email, password);
    setTokens(respuesta.access, respuesta.refresh);
    const usuarioActual = await obtenerUsuarioActual();
    setUsuario(usuarioActual);
    return usuarioActual;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
