import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import {
  actualizarCliente,
  eliminarCliente,
  listarClientes,
  obtenerEstadoCanjes,
} from "../api/clientes";
import { listarCanjes, listarCompras } from "../api/compras";
import { extractErrorMessage } from "../api/client";
import { LeyendaAcciones } from "../components/LeyendaAcciones";
import { formatFechaHora } from "../utils/fecha";
import type { Canje, Cliente, Compra, EstadoCanje } from "../types";

export function ClientesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await listarClientes({ search: busqueda || undefined });
      setClientes(respuesta.results);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCargando(false);
    }
  }, [busqueda]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleEliminar(cliente: Cliente) {
    if (
      !window.confirm(`¿Eliminar a "${cliente.nombre}" (${cliente.cedula})? No se puede deshacer.`)
    ) {
      return;
    }
    setProcesando(cliente.id);
    try {
      await eliminarCliente(cliente.id);
      await cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <h1>Mantenimiento de clientes</h1>

      <input
        placeholder="Buscar por nombre o cédula…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {error && <p className="field-error">{error}</p>}

      <LeyendaAcciones
        items={[
          { icono: "bi-clock-history", etiqueta: "Ver historial" },
          { icono: "bi-pencil-square", etiqueta: "Editar" },
          { icono: "bi-trash", etiqueta: "Eliminar" },
        ]}
      />

      {cargando ? (
        <p>Cargando…</p>
      ) : clientes.length === 0 ? (
        <p>No hay clientes que coincidan con la búsqueda.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <Fragment key={c.id}>
                <tr>
                  <td>{c.nombre}</td>
                  <td>{c.cedula}</td>
                  <td>{formatFechaHora(c.creado_en)}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn-icon-only btn-secondary"
                        title={detalleId === c.id ? "Ocultar historial" : "Ver historial"}
                        aria-label={detalleId === c.id ? "Ocultar historial" : "Ver historial"}
                        onClick={() => {
                          setDetalleId(detalleId === c.id ? null : c.id);
                          setEditandoId(null);
                        }}
                      >
                        <i
                          className={detalleId === c.id ? "bi bi-x-lg" : "bi bi-clock-history"}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-only btn-secondary"
                        title={editandoId === c.id ? "Cerrar" : "Editar"}
                        aria-label={editandoId === c.id ? "Cerrar" : "Editar"}
                        onClick={() => {
                          setEditandoId(editandoId === c.id ? null : c.id);
                          setDetalleId(null);
                        }}
                      >
                        <i
                          className={editandoId === c.id ? "bi bi-x-lg" : "bi bi-pencil-square"}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-only btn-danger"
                        title="Eliminar"
                        aria-label="Eliminar"
                        disabled={procesando === c.id}
                        onClick={() => handleEliminar(c)}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editandoId === c.id && (
                  <tr>
                    <td colSpan={4}>
                      <EditarClienteForm
                        cliente={c}
                        onGuardado={async () => {
                          setEditandoId(null);
                          await cargar();
                        }}
                        onCancelar={() => setEditandoId(null)}
                      />
                    </td>
                  </tr>
                )}
                {detalleId === c.id && (
                  <tr>
                    <td colSpan={4}>
                      <HistorialCliente cliente={c} />
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

function EditarClienteForm({
  cliente,
  onGuardado,
  onCancelar,
}: {
  cliente: Cliente;
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState(cliente.nombre);
  const [cedula, setCedula] = useState(cliente.cedula);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await actualizarCliente(cliente.id, { nombre, cedula });
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
        Cédula
        <input value={cedula} onChange={(e) => setCedula(e.target.value)} required />
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

function HistorialCliente({ cliente }: { cliente: Cliente }) {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [canjes, setCanjes] = useState<Canje[]>([]);
  const [estados, setEstados] = useState<EstadoCanje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    Promise.all([
      listarCompras({ cliente: cliente.id }),
      listarCanjes({ cliente: cliente.id }),
      obtenerEstadoCanjes(cliente.id),
    ])
      .then(([resCompras, resCanjes, resEstados]) => {
        setCompras(resCompras.results);
        setCanjes(resCanjes.results);
        setEstados(resEstados);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, [cliente.id]);

  if (cargando) return <p>Cargando historial…</p>;
  if (error) return <p className="field-error">{error}</p>;

  return (
    <div style={{ padding: "0.5rem 0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <h3>Estado del plan paciente</h3>
      {estados.length === 0 ? (
        <p className="field-hint">Sin compras registradas todavía.</p>
      ) : (
        <ul className="planes-list">
          {estados.map((estado) => (
            <li key={estado.plan_id}>
              <strong>
                {estado.medicamento_nombre} — {estado.plan_nombre}
              </strong>{" "}
              (compra {estado.cantidad_comprada}, llevate {estado.cantidad_gratis} gratis):
              llevás {estado.unidades_disponibles} de {estado.cantidad_comprada} unidades
              {estado.aplica_canje ? (
                <span className="badge badge-aprobada"> aplica canje</span>
              ) : (
                <span className="badge badge-pendiente">
                  {" "}
                  faltan {estado.unidades_para_proximo_canje}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Compras</h3>
      {compras.length === 0 ? (
        <p className="field-hint">Sin compras registradas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Factura</th>
              <th>Cantidad</th>
              <th>Farmacia</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id}>
                <td>{compra.medicamento_nombre}</td>
                <td>{compra.numero_factura}</td>
                <td>{compra.cantidad}</td>
                <td>{compra.farmacia_nombre}</td>
                <td>{formatFechaHora(compra.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Canjes</h3>
      {canjes.length === 0 ? (
        <p className="field-hint">Sin canjes registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cantidad</th>
              <th>Farmacia</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {canjes.map((canje) => (
              <tr key={canje.id}>
                <td>{canje.plan_nombre}</td>
                <td>{canje.cantidad}</td>
                <td>{canje.farmacia_nombre}</td>
                <td>{formatFechaHora(canje.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
