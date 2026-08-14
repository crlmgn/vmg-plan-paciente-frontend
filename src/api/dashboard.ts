import { apiClient } from "./client";
import type { ResumenDashboard } from "../types";

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const { data } = await apiClient.get<ResumenDashboard>("/dashboard/resumen/");
  return data;
}

export async function descargarCanjesCSV(): Promise<void> {
  const { data } = await apiClient.get<Blob>("/dashboard/canjes.csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(data);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "canjes.csv";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}
