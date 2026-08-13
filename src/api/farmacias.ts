import { apiClient } from "./client";
import type { CheckEmailResponse, EstadoFarmacia, Farmacia, Paginated } from "../types";

export interface RegistroFarmaciaPayload {
  nombre: string;
  correo_contacto: string;
  telefono: string;
  provincia: number;
  canton: number;
  distrito: number;
}

export async function checkEmail(correo: string): Promise<CheckEmailResponse> {
  const { data } = await apiClient.post<CheckEmailResponse>("/farmacias/check-email/", { correo });
  return data;
}

export async function registrarFarmacia(payload: RegistroFarmaciaPayload): Promise<void> {
  await apiClient.post("/farmacias/registro/", payload);
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

export async function obtenerMiFarmacia(): Promise<Farmacia> {
  const { data } = await apiClient.get<Farmacia>("/farmacias/me/");
  return data;
}
