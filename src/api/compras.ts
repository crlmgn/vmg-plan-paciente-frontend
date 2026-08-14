import { apiClient } from "./client";
import type { Canje, Compra, Paginated } from "../types";

export interface RegistrarCompraPayload {
  cliente: string;
  medicamento: number;
  numero_factura: string;
  cantidad: number;
  /** Solo la manda un admin: una farmacia siempre opera sobre sí misma. */
  farmacia?: number;
  foto_factura?: File;
}

export async function registrarCompra(payload: RegistrarCompraPayload): Promise<Compra> {
  if (!payload.foto_factura) {
    const { data } = await apiClient.post<Compra>("/compras/", payload);
    return data;
  }
  const formData = new FormData();
  formData.append("cliente", payload.cliente);
  formData.append("medicamento", String(payload.medicamento));
  formData.append("numero_factura", payload.numero_factura);
  formData.append("cantidad", String(payload.cantidad));
  if (payload.farmacia !== undefined) formData.append("farmacia", String(payload.farmacia));
  formData.append("foto_factura", payload.foto_factura);
  const { data } = await apiClient.post<Compra>("/compras/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  cliente?: string;
  farmacia?: number;
  page?: number;
}): Promise<Paginated<Compra>> {
  const { data } = await apiClient.get<Paginated<Compra>>("/compras/", { params });
  return data;
}

export async function registrarCanje(
  cliente: string,
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
  cliente?: string;
  farmacia?: number;
  page?: number;
}): Promise<Paginated<Canje>> {
  const { data } = await apiClient.get<Paginated<Canje>>("/canjes/", { params });
  return data;
}
