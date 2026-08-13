import { apiClient } from "./client";
import type { Canton, Distrito, Provincia } from "../types";

export async function listarProvincias(): Promise<Provincia[]> {
  const { data } = await apiClient.get<Provincia[]>("/ubicaciones/provincias/");
  return data;
}

export async function listarCantones(provinciaId: number): Promise<Canton[]> {
  const { data } = await apiClient.get<Canton[]>("/ubicaciones/cantones/", {
    params: { provincia: provinciaId },
  });
  return data;
}

export async function listarDistritos(cantonId: number): Promise<Distrito[]> {
  const { data } = await apiClient.get<Distrito[]>("/ubicaciones/distritos/", {
    params: { canton: cantonId },
  });
  return data;
}
