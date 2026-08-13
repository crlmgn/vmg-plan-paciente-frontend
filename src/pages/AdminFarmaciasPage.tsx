import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import {
  actualizarFarmacia,
  aprobarFarmacia,
  crearFarmaciaAdmin,
  eliminarFarmacia,
  listarFarmacias,
  rechazarFarmacia,
} from "../api/farmacias";
import { extractErrorMessage } from "../api/client";
import { LeyendaAcciones } from "../components/LeyendaAcciones";
import { UbicacionSelects } from "../components/UbicacionSelects";
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
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);

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

  async function handleEliminar(farmacia: Farmacia) {
    if (
      !window.confirm(
        `¿Eliminar la farmacia "${farmacia.nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setProcesando(farmacia.id);
    try {
      await eliminarFarmacia(farmacia.id);
      await cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <h1>Mantenimiento de farmacias</h1>
        <button type="button" className="btn-icon" onClick={() => setCreando((v) => !v)}>
          {creando ? (
            <>
              <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg" aria-hidden="true" /> Agregar farmacia
            </>
          )}
        </button>
      </div>

      {creando && (
        <div className="card card-narrow">
          <NuevaFarmaciaForm
            onGuardado={async () => {
              setCreando(false);
              await cargar();
            }}
            onCancelar={() => setCreando(false)}
          />
        </div>
      )}

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

      <LeyendaAcciones
        items={[
          { icono: "bi-check-lg", etiqueta: "Aprobar" },
          { icono: "bi-x-circle", etiqueta: "Rechazar" },
          { icono: "bi-pencil-square", etiqueta: "Editar" },
          { icono: "bi-trash", etiqueta: "Eliminar" },
        ]}
      />

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
              <Fragment key={f.id}>
                <tr>
                  <td>{f.nombre}</td>
                  <td>{f.correo_contacto}</td>
                  <td>
                    {[
                      f.distrito_detalle?.nombre,
                      f.canton_detalle?.nombre,
                      f.provincia_detalle?.nombre,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {f.direccion_exacta && (
                      <div className="field-hint">{f.direccion_exacta}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${f.estado}`}>{f.estado}</span>
                    {f.estado === "rechazada" && f.motivo_rechazo && (
                      <div className="field-hint">{f.motivo_rechazo}</div>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      {f.estado === "pendiente" && (
                        <>
                          <button
                            type="button"
                            className="btn-icon-only"
                            title="Aprobar"
                            aria-label="Aprobar"
                            disabled={procesando === f.id}
                            onClick={() => handleAprobar(f.id)}
                          >
                            <i className="bi bi-check-lg" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-only btn-danger"
                            title="Rechazar"
                            aria-label="Rechazar"
                            disabled={procesando === f.id}
                            onClick={() => handleRechazar(f.id)}
                          >
                            <i className="bi bi-x-circle" aria-hidden="true" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn-icon-only btn-secondary"
                        title={editandoId === f.id ? "Cerrar" : "Editar"}
                        aria-label={editandoId === f.id ? "Cerrar" : "Editar"}
                        onClick={() => setEditandoId(editandoId === f.id ? null : f.id)}
                      >
                        <i
                          className={editandoId === f.id ? "bi bi-x-lg" : "bi bi-pencil-square"}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-only btn-danger"
                        title="Eliminar"
                        aria-label="Eliminar"
                        disabled={procesando === f.id}
                        onClick={() => handleEliminar(f)}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editandoId === f.id && (
                  <tr>
                    <td colSpan={5}>
                      <EditarFarmaciaForm
                        farmacia={f}
                        onGuardado={async () => {
                          setEditandoId(null);
                          await cargar();
                        }}
                        onCancelar={() => setEditandoId(null)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EditarFarmaciaForm({
  farmacia,
  onGuardado,
  onCancelar,
}: {
  farmacia: Farmacia;
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState(farmacia.nombre);
  const [telefono, setTelefono] = useState(farmacia.telefono);
  const [direccionExacta, setDireccionExacta] = useState(farmacia.direccion_exacta);
  const [provinciaId, setProvinciaId] = useState(String(farmacia.provincia));
  const [cantonId, setCantonId] = useState(String(farmacia.canton));
  const [distritoId, setDistritoId] = useState(String(farmacia.distrito));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await actualizarFarmacia(farmacia.id, {
        nombre,
        telefono,
        direccion_exacta: direccionExacta,
        provincia: Number(provinciaId),
        canton: Number(cantonId),
        distrito: Number(distritoId),
      });
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" style={{ maxWidth: 420, padding: "1rem 0" }}>
      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>
      <label>
        Teléfono
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
      </label>

      <UbicacionSelects
        provinciaId={provinciaId}
        cantonId={cantonId}
        distritoId={distritoId}
        onChange={(siguiente) => {
          setProvinciaId(siguiente.provinciaId);
          setCantonId(siguiente.cantonId);
          setDistritoId(siguiente.distritoId);
        }}
      />

      <label>
        Dirección exacta
        <textarea
          value={direccionExacta}
          onChange={(e) => setDireccionExacta(e.target.value)}
          rows={3}
          required
        />
      </label>

      {error && <p className="field-error">{error}</p>}

      <div className="actions">
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function NuevaFarmaciaForm({
  onGuardado,
  onCancelar,
}: {
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccionExacta, setDireccionExacta] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [distritoId, setDistritoId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearFarmaciaAdmin({
        nombre,
        correo_contacto: correoContacto,
        telefono,
        direccion_exacta: direccionExacta,
        provincia: Number(provinciaId),
        canton: Number(cantonId),
        distrito: Number(distritoId),
      });
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <p className="field-hint">
        Alta manual: la farmacia queda aprobada de inmediato y recibe el correo de activación de
        cuenta, sin pasar por el autorregistro público.
      </p>
      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>
      <label>
        Correo de contacto
        <input
          type="email"
          value={correoContacto}
          onChange={(e) => setCorreoContacto(e.target.value)}
          required
        />
      </label>
      <label>
        Teléfono
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
      </label>

      <UbicacionSelects
        provinciaId={provinciaId}
        cantonId={cantonId}
        distritoId={distritoId}
        onChange={(siguiente) => {
          setProvinciaId(siguiente.provinciaId);
          setCantonId(siguiente.cantonId);
          setDistritoId(siguiente.distritoId);
        }}
      />

      <label>
        Dirección exacta
        <textarea
          value={direccionExacta}
          onChange={(e) => setDireccionExacta(e.target.value)}
          rows={3}
          required
        />
      </label>

      {error && <p className="field-error">{error}</p>}

      <div className="actions">
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Crear farmacia"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
