import { apiClient } from "./client";
import type { CheckEmailResponse, EstadoFarmacia, Farmacia, Paginated } from "../types";

export interface RegistroFarmaciaPayload {
  nombre: string;
  correo_contacto: string;
  telefono: string;
  provincia: number;
  canton: number;
  distrito: number;
  direccion_exacta: string;
}

export type ActualizarFarmaciaPayload = Partial<
  Pick<
    Farmacia,
    "nombre" | "telefono" | "direccion_exacta" | "provincia" | "canton" | "distrito"
  >
>;

export async function checkEmail(correo: string): Promise<CheckEmailResponse> {
  const { data } = await apiClient.post<CheckEmailResponse>("/farmacias/check-email/", { correo });
  return data;
}

export async function registrarFarmacia(payload: RegistroFarmaciaPayload): Promise<void> {
  await apiClient.post("/farmacias/registro/", payload);
}

/** Alta manual por un admin (fuera del autorregistro): queda aprobada de una
 * vez y se envía el correo de activación de cuenta. */
export async function crearFarmaciaAdmin(payload: RegistroFarmaciaPayload): Promise<Farmacia> {
  const { data } = await apiClient.post<Farmacia>("/farmacias/", payload);
  return data;
}

export async function eliminarFarmacia(id: number): Promise<void> {
  await apiClient.delete(`/farmacias/${id}/`);
}

export async function listarFarmacias(params: {
  estado?: EstadoFarmacia;
  search?: string;
  page?: number;
}): Promise<Paginated<Farmacia>> {
  const { data } = await apiClient.get<Paginated<Farmacia>>("/farmacias/", { params });
  return data;
}

export async function aprobarFarmacia(id: number): Promise<Farmacia> {
  const { data } = await apiClient.post<Farmacia>(`/farmacias/${id}/aprobar/`);
  return data;
}

export async function rechazarFarmacia(id: number, motivo: string): Promise<Farmacia> {
  const { data } = await apiClient.post<Farmacia>(`/farmacias/${id}/rechazar/`, { motivo });
  return data;
}

export async function actualizarFarmacia(
  id: number,
  payload: ActualizarFarmaciaPayload,
): Promise<Farmacia> {
  const { data } = await apiClient.patch<Farmacia>(`/farmacias/${id}/`, payload);
  return data;
}

export async function obtenerMiFarmacia(): Promise<Farmacia> {
  const { data } = await apiClient.get<Farmacia>("/farmacias/me/");
  return data;
}
