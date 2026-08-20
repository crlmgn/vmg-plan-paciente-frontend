import { apiClient } from "./client";
import type { MiProgreso } from "../types";

export async function obtenerMiProgreso(): Promise<MiProgreso> {
  const { data } = await apiClient.get<MiProgreso>("/mi-progreso/");
  return data;
}
