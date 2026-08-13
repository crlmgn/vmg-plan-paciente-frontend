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

export async function crearCliente(nombre: string, cedula: string): Promise<Cliente> {
  const { data } = await apiClient.post<Cliente>("/clientes/", { nombre, cedula });
  return data;
}

export async function actualizarCliente(
  id: number,
  payload: Partial<Pick<Cliente, "nombre" | "cedula">>,
): Promise<Cliente> {
  const { data } = await apiClient.patch<Cliente>(`/clientes/${id}/`, payload);
  return data;
}

export async function eliminarCliente(id: number): Promise<void> {
  await apiClient.delete(`/clientes/${id}/`);
}

export async function obtenerEstadoCanjes(clienteId: number): Promise<EstadoCanje[]> {
  const { data } = await apiClient.get<EstadoCanje[]>(`/clientes/${clienteId}/estado-canjes/`);
  return data;
}
