import { apiClient } from "./client";
import type { Medicamento, Paginated, Plan } from "../types";

export async function listarMedicamentos(search?: string): Promise<Paginated<Medicamento>> {
  const { data } = await apiClient.get<Paginated<Medicamento>>("/medicamentos/", {
    params: search ? { search } : undefined,
  });
  return data;
}

export interface MedicamentoPayload {
  nombre: string;
  descripcion?: string;
  presentacion?: string;
  cantidad?: number | null;
  fuerza_mg?: number | null;
  activo?: boolean;
}

export async function crearMedicamento(payload: MedicamentoPayload): Promise<Medicamento> {
  const { data } = await apiClient.post<Medicamento>("/medicamentos/", payload);
  return data;
}

export async function actualizarMedicamento(
  id: number,
  payload: Partial<MedicamentoPayload>,
): Promise<Medicamento> {
  const { data } = await apiClient.patch<Medicamento>(`/medicamentos/${id}/`, payload);
  return data;
}

export async function eliminarMedicamento(id: number): Promise<void> {
  await apiClient.delete(`/medicamentos/${id}/`);
}

export interface PlanPayload {
  nombre: string;
  descripcion?: string;
  cantidad_comprada: number;
  cantidad_gratis: number;
  activo?: boolean;
}

export async function crearPlan(medicamentoId: number, payload: PlanPayload): Promise<Plan> {
  const { data } = await apiClient.post<Plan>(
    `/medicamentos/${medicamentoId}/planes/`,
    payload,
  );
  return data;
}

export async function actualizarPlan(
  medicamentoId: number,
  planId: number,
  payload: Partial<PlanPayload>,
): Promise<Plan> {
  const { data } = await apiClient.patch<Plan>(
    `/medicamentos/${medicamentoId}/planes/${planId}/`,
    payload,
  );
  return data;
}

export async function eliminarPlan(medicamentoId: number, planId: number): Promise<void> {
  await apiClient.delete(`/medicamentos/${medicamentoId}/planes/${planId}/`);
}
