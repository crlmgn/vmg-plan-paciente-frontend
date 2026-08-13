import { apiClient } from "./client";
import type { LoginResponse, Usuario } from "../types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/token/", { email, password });
  return data;
}

export async function activarCuenta(uid: string, token: string, password: string): Promise<void> {
  await apiClient.post("/auth/activar/", { uid, token, password });
}

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>("/usuarios/me/");
  return data;
}
