import { apiClient } from "./client";
import type { Cliente, EstadoCanje, Paginated } from "../types";

export async function buscarClientes(termino: string): Promise<Paginated<Cliente>> {
  const { data } = await apiClient.get<Paginated<Cliente>>("/clientes/", {
    params: { search: termino },
  });
  return data;
}

export async function listarClientes(params: {
  search?: string;
  page?: number;
}): Promise<Paginated<Cliente>> {
  const { data } = await apiClient.get<Paginated<Cliente>>("/clientes/", { params });
  return data;
}

export interface CrearClientePayload {
  nombre: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  cedula: string;
}

export async function crearCliente(payload: CrearClientePayload): Promise<Cliente> {
  const { data } = await apiClient.post<Cliente>("/clientes/", payload);
  return data;
}

export async function actualizarCliente(
  id: string,
  payload: Partial<Pick<Cliente, "nombre" | "primer_apellido" | "segundo_apellido" | "cedula">>,
): Promise<Cliente> {
  const { data } = await apiClient.patch<Cliente>(`/clientes/${id}/`, payload);
  return data;
}

export async function eliminarCliente(id: string): Promise<void> {
  await apiClient.delete(`/clientes/${id}/`);
}

export async function obtenerEstadoCanjes(clienteId: string): Promise<EstadoCanje[]> {
  const { data } = await apiClient.get<EstadoCanje[]>(`/clientes/${clienteId}/estado-canjes/`);
  return data;
}
