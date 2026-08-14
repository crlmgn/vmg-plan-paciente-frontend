import type { Cliente } from "../types";

/** Igual que el `nombre_completo` que ya calcula el backend — se reimplementa
 * acá para cuando se arma un `Cliente` en el cliente sin pasar por la API
 * (ej. la precarga de "aplica canje -> ir a canjear"). */
export function nombreCompleto(
  cliente: Pick<Cliente, "nombre" | "primer_apellido" | "segundo_apellido">,
): string {
  return [cliente.nombre, cliente.primer_apellido, cliente.segundo_apellido]
    .filter(Boolean)
    .join(" ");
}
