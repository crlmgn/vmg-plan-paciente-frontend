import { useEffect, useState } from "react";
import { listarMedicamentos } from "../api/medicamentos";
import { extractErrorMessage } from "../api/client";
import type { Medicamento } from "../types";

export function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    listarMedicamentos(busqueda || undefined)
      .then((r) => setMedicamentos(r.results))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, [busqueda]);

  return (
    <div>
      <h1>Medicamentos y planes</h1>

      <input
        placeholder="Buscar medicamento…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {error && <p className="field-error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : medicamentos.length === 0 ? (
        <p>No hay medicamentos que coincidan con la búsqueda.</p>
      ) : (
        <div className="medicamentos-grid">
          {medicamentos.map((med) => (
            <div key={med.id} className="card">
              <h2>{med.nombre}</h2>
              {med.descripcion && <p>{med.descripcion}</p>}
              {med.planes.length === 0 ? (
                <p className="field-hint">Sin planes activos.</p>
              ) : (
                <ul className="planes-list">
                  {med.planes
                    .filter((p) => p.activo)
                    .map((plan) => (
                      <li key={plan.id}>
                        <strong>{plan.nombre}</strong>
                        {plan.descripcion && ` — ${plan.descripcion}`}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
