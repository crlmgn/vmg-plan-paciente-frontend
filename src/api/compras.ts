import { apiClient } from "./client";
import type { Canje, Compra, Paginated } from "../types";

export interface RegistrarCompraPayload {
  cliente: number;
  medicamento: number;
  numero_factura: string;
  cantidad: number;
  /** Solo la manda un admin: una farmacia siempre opera sobre sí misma. */
  farmacia?: number;
}

export async function registrarCompra(payload: RegistrarCompraPayload): Promise<Compra> {
  const { data } = await apiClient.post<Compra>("/compras/", payload);
  return data;
}

export type ActualizarCompraPayload = Partial<
  Pick<Compra, "medicamento" | "numero_factura" | "cantidad" | "fecha" | "farmacia">
>;

export async function actualizarCompra(
  id: number,
  payload: ActualizarCompraPayload,
): Promise<Compra> {
  const { data } = await apiClient.patch<Compra>(`/compras/${id}/`, payload);
  return data;
}

export async function listarCompras(params: {
  cliente?: number;
  farmacia?: number;
  page?: number;
}): Promise<Paginated<Compra>> {
  const { data } = await apiClient.get<Paginated<Compra>>("/compras/", { params });
  return data;
}

export async function registrarCanje(
  cliente: number,
  plan: number,
  farmacia?: number,
): Promise<Canje> {
  const { data } = await apiClient.post<Canje>("/canjes/", { cliente, plan, farmacia });
  return data;
}

export type ActualizarCanjePayload = Partial<Pick<Canje, "fecha" | "farmacia">>;

export async function actualizarCanje(
  id: number,
  payload: ActualizarCanjePayload,
): Promise<Canje> {
  const { data } = await apiClient.patch<Canje>(`/canjes/${id}/`, payload);
  return data;
}

export async function listarCanjes(params: {
  cliente?: number;
  farmacia?: number;
  page?: number;
}): Promise<Paginated<Canje>> {
  const { data } = await apiClient.get<Paginated<Canje>>("/canjes/", { params });
  return data;
}
