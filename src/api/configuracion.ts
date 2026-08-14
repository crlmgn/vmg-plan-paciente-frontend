import { apiClient } from "./client";
import type { ConfiguracionSMTP } from "../types";

export async function obtenerConfiguracionSmtp(): Promise<ConfiguracionSMTP> {
  const { data } = await apiClient.get<ConfiguracionSMTP>("/configuracion/smtp/");
  return data;
}

export interface ActualizarConfiguracionSmtpPayload {
  host: string;
  puerto: number;
  usuario: string;
  /** Vacío/omitido: conserva la contraseña que ya había guardada. */
  password?: string;
  usar_tls: boolean;
  from_email: string;
}

export async function actualizarConfiguracionSmtp(
  payload: ActualizarConfiguracionSmtpPayload,
): Promise<ConfiguracionSMTP> {
  const { data } = await apiClient.patch<ConfiguracionSMTP>("/configuracion/smtp/", payload);
  return data;
}

export async function probarConfiguracionSmtp(destinatario: string): Promise<{ detail: string }> {
  const { data } = await apiClient.post<{ detail: string }>("/configuracion/smtp/probar/", {
    destinatario,
  });
  return data;
}
