import { apiClient } from "./client";
import type { Mensaje, Paginated, TipoMensaje } from "../types";

export interface MensajePayload {
  texto: string;
  tipo: TipoMensaje;
  activo?: boolean;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

export async function listarMensajes(params?: { activo?: boolean }): Promise<Paginated<Mensaje>> {
  const { data } = await apiClient.get<Paginated<Mensaje>>("/mensajes/", { params });
  return data;
}

/** Endpoint público (sin autenticación) que alimenta el cintillo de noticias
 * — se ve en todas las páginas, esté o no logueado el usuario. */
export async function listarMensajesActivos(): Promise<Mensaje[]> {
  const { data } = await apiClient.get<Mensaje[]>("/mensajes/activos/");
  return data;
}

export async function crearMensaje(payload: MensajePayload): Promise<Mensaje> {
  const { data } = await apiClient.post<Mensaje>("/mensajes/", payload);
  return data;
}

export async function actualizarMensaje(
  id: number,
  payload: Partial<MensajePayload>,
): Promise<Mensaje> {
  const { data } = await apiClient.patch<Mensaje>(`/mensajes/${id}/`, payload);
  return data;
}

export async function eliminarMensaje(id: number): Promise<void> {
  await apiClient.delete(`/mensajes/${id}/`);
}
