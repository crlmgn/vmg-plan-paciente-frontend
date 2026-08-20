import { useEffect, useState } from "react";
import { listarMensajesActivos } from "../api/mensajes";
import type { Mensaje } from "../types";

export function NoticiasBar() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  useEffect(() => {
    // Público a propósito: se muestra en todas las páginas, con o sin sesión
    // iniciada.
    listarMensajesActivos()
      .then(setMensajes)
      .catch(() => setMensajes([]));
  }, []);

  if (mensajes.length === 0) return null;

  // Se duplica la lista para que la animación de scroll haga un loop
  // continuo sin salto visible al llegar al final.
  const items = [...mensajes, ...mensajes];

  return (
    <div className="noticias-bar">
      <div className="noticias-track">
        {items.map((mensaje, i) => (
          <span key={`${mensaje.id}-${i}`} className={`noticias-item noticias-item-${mensaje.tipo}`}>
            <i
              className={mensaje.tipo === "oferta" ? "bi bi-gift" : "bi bi-megaphone"}
              aria-hidden="true"
            />
            {mensaje.texto}
          </span>
        ))}
      </div>
    </div>
  );
}
