import { useCallback, useEffect, useState } from "react";
import { aprobarFarmacia, listarFarmacias, rechazarFarmacia } from "../api/farmacias";
import { extractErrorMessage } from "../api/client";
import type { EstadoFarmacia, Farmacia } from "../types";

const FILTROS: { valor: EstadoFarmacia | "todas"; etiqueta: string }[] = [
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "aprobada", etiqueta: "Aprobadas" },
  { valor: "rechazada", etiqueta: "Rechazadas" },
  { valor: "todas", etiqueta: "Todas" },
];

export function AdminFarmaciasPage() {
  const [filtro, setFiltro] = useState<EstadoFarmacia | "todas">("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await listarFarmacias({
        estado: filtro === "todas" ? undefined : filtro,
        search: busqueda || undefined,
      });
      setFarmacias(respuesta.results);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCargando(false);
    }
  }, [filtro, busqueda]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleAprobar(id: number) {
    setProcesando(id);
    try {
      await aprobarFarmacia(id);
      await cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setProcesando(null);
    }
  }

  async function handleRechazar(id: number) {
    const motivo = window.prompt("Motivo del rechazo:");
    if (!motivo) return;
    setProcesando(id);
    try {
      await rechazarFarmacia(id, motivo);
      await cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <h1>Mantenimiento de farmacias</h1>

      <div className="toolbar">
        <div className="tabs">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              className={filtro === f.valor ? "tab tab-active" : "tab"}
              onClick={() => setFiltro(f.valor)}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
        <input
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : farmacias.length === 0 ? (
        <p>No hay farmacias en este filtro.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Farmacia</th>
              <th>Correo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {farmacias.map((f) => (
              <tr key={f.id}>
                <td>{f.nombre}</td>
                <td>{f.correo_contacto}</td>
                <td>
                  {[f.distrito_detalle?.nombre, f.canton_detalle?.nombre, f.provincia_detalle?.nombre]
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td>
                  <span className={`badge badge-${f.estado}`}>{f.estado}</span>
                  {f.estado === "rechazada" && f.motivo_rechazo && (
                    <div className="field-hint">{f.motivo_rechazo}</div>
                  )}
                </td>
                <td>
                  {f.estado === "pendiente" && (
                    <div className="actions">
                      <button
                        type="button"
                        disabled={procesando === f.id}
                        onClick={() => handleAprobar(f.id)}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={procesando === f.id}
                        onClick={() => handleRechazar(f.id)}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
