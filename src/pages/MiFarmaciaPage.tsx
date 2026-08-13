import { useEffect, useState } from "react";
import { obtenerMiFarmacia } from "../api/farmacias";
import { extractErrorMessage } from "../api/client";
import type { Farmacia } from "../types";

export function MiFarmaciaPage() {
  const [farmacia, setFarmacia] = useState<Farmacia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMiFarmacia()
      .then(setFarmacia)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando…</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (!farmacia) return null;

  return (
    <div className="card">
      <h1>{farmacia.nombre}</h1>
      <span className={`badge badge-${farmacia.estado}`}>{farmacia.estado}</span>

      <dl className="detail-list">
        <dt>Correo de contacto</dt>
        <dd>{farmacia.correo_contacto}</dd>
        <dt>Teléfono</dt>
        <dd>{farmacia.telefono}</dd>
        <dt>Ubicación</dt>
        <dd>
          {[farmacia.distrito_detalle?.nombre, farmacia.canton_detalle?.nombre, farmacia.provincia_detalle?.nombre]
            .filter(Boolean)
            .join(", ")}
        </dd>
      </dl>
    </div>
  );
}
