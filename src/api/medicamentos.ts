import { apiClient } from "./client";
import type { Medicamento, Paginated } from "../types";

export async function listarMedicamentos(search?: string): Promise<Paginated<Medicamento>> {
  const { data } = await apiClient.get<Paginated<Medicamento>>("/medicamentos/", {
    params: search ? { search } : undefined,
  });
  return data;
}
