/** Formatea un ISO datetime del backend como fecha + hora legible en local. */
export function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Convierte un ISO datetime a formato datetime-local ("YYYY-MM-DDTHH:mm")
 * para precargar un <input type="datetime-local">, en la zona horaria local
 * del navegador. */
export function toDatetimeLocalValue(iso: string): string {
  const fecha = new Date(iso);
  const offsetMs = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offsetMs).toISOString().slice(0, 16);
}
