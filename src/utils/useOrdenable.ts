import { useMemo, useState } from "react";

export type Direccion = "asc" | "desc";

/** Ordena una lista por columna al hacer clic en el encabezado — ordena solo
 * lo que ya está cargado en pantalla (no pide una página distinta al
 * backend). `obtenerValor` extrae el valor comparable de cada fila para una
 * clave de columna dada. */
export function useOrdenable<T, K extends string>(
  items: T[],
  obtenerValor: (item: T, clave: K) => string | number,
) {
  const [clave, setClave] = useState<K | null>(null);
  const [direccion, setDireccion] = useState<Direccion>("asc");

  function ordenarPor(nuevaClave: K) {
    if (clave === nuevaClave) {
      setDireccion(direccion === "asc" ? "desc" : "asc");
    } else {
      setClave(nuevaClave);
      setDireccion("asc");
    }
  }

  const itemsOrdenados = useMemo(() => {
    if (!clave) return items;
    const copia = [...items];
    copia.sort((a, b) => {
      const va = obtenerValor(a, clave);
      const vb = obtenerValor(b, clave);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return direccion === "asc" ? cmp : -cmp;
    });
    return copia;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, clave, direccion]);

  function iconoDe(columna: K): string {
    if (clave !== columna) return "bi-arrow-down-up";
    return direccion === "asc" ? "bi-sort-up" : "bi-sort-down";
  }

  return { itemsOrdenados, ordenarPor, iconoDe, claveActiva: clave };
}
