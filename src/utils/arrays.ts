/** Blindaje ante respuestas del backend con una forma inesperada (ej. `null`
 * o un objeto en vez de un array): nunca dejamos un estado de tipo lista en
 * algo que no sea array, así el `.map`/`.filter`/`.join` que sigue no
 * revienta el render. */
export function comoArray<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : [];
}
