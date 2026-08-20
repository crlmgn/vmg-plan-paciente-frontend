import { useEffect, useState } from "react";
import { obtenerMiProgreso } from "../api/progreso";
import type { MiProgreso } from "../types";

export function PuntajeBadge() {
  const [progreso, setProgreso] = useState<MiProgreso | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    obtenerMiProgreso()
      .then(setProgreso)
      .catch(() => setProgreso(null));
  }, []);

  if (!progreso) return null;

  const tamanoDelNivel = progreso.puntos_en_nivel_actual + progreso.puntos_para_siguiente_nivel;
  const avance = Math.round((progreso.puntos_en_nivel_actual / tamanoDelNivel) * 100);

  return (
    <div className="puntaje-badge">
      <button
        type="button"
        className="puntaje-badge-trigger"
        onClick={() => setAbierto((v) => !v)}
      >
        <i className="bi bi-trophy-fill" aria-hidden="true" /> {progreso.puntos.toLocaleString("es-CR")}{" "}
        pts
      </button>
      {abierto && (
        <div className="puntaje-badge-panel">
          <div className="puntaje-badge-nivel">
            <span>Nivel {progreso.nivel}</span>
            <span className="field-hint">
              {progreso.puntos_para_siguiente_nivel} pts para el siguiente nivel
            </span>
            <div className="puntaje-badge-barra">
              <div className="puntaje-badge-barra-relleno" style={{ width: `${avance}%` }} />
            </div>
          </div>
          <dl className="puntaje-badge-stats">
            <div>
              <dt>
                <i className="bi bi-fire" aria-hidden="true" /> Racha de inicios de sesión
              </dt>
              <dd>
                {progreso.racha_actual} días (mejor: {progreso.mejor_racha})
              </dd>
            </div>
            <div>
              <dt>
                <i className="bi bi-gift" aria-hidden="true" /> Canjes realizados
              </dt>
              <dd>{progreso.canjes_realizados}</dd>
            </div>
            <div>
              <dt>
                <i className="bi bi-capsule" aria-hidden="true" /> Producto más comprado
              </dt>
              <dd>{progreso.producto_mas_comprado ?? "Sin datos todavía"}</dd>
            </div>
            <div>
              <dt>
                <i className="bi bi-person-heart" aria-hidden="true" /> Cliente con más canjes
              </dt>
              <dd>{progreso.cliente_con_mas_canjes ?? "Sin datos todavía"}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
