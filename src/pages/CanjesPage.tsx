import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import { buscarClientes, crearCliente, obtenerEstadoCanjes } from "../api/clientes";
import {
  actualizarCanje,
  listarCanjes,
  listarCompras,
  registrarCanje,
  registrarCompra,
} from "../api/compras";
import { listarFarmacias } from "../api/farmacias";
import { listarMedicamentos } from "../api/medicamentos";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { LeyendaAcciones } from "../components/LeyendaAcciones";
import { formatFechaHora, toDatetimeLocalValue } from "../utils/fecha";
import type { Canje, Cliente, Compra, EstadoCanje, Farmacia, Medicamento } from "../types";

export function CanjesPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const [canjes, setCanjes] = useState<Canje[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [agregando, setAgregando] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    return listarCanjes({})
      .then((r) => setCanjes(r.results))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
    if (esAdmin) {
      listarFarmacias({ estado: "aprobada" }).then((r) => setFarmacias(r.results));
    }
  }, [cargar, esAdmin]);

  return (
    <div>
      <div className="toolbar">
        <h1>Control de canjes</h1>
        <button type="button" className="btn-icon" onClick={() => setAgregando((v) => !v)}>
          {agregando ? (
            <>
              <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg" aria-hidden="true" /> Agregar compra
            </>
          )}
        </button>
      </div>

      {agregando && (
        <AgregarCompra
          esAdmin={esAdmin}
          farmacias={farmacias}
          onRegistrado={() => {
            cargar();
          }}
        />
      )}

      <p className="field-hint">
        {esAdmin
          ? "Todos los canjes registrados, en todas las farmacias."
          : "Los canjes registrados en tu farmacia."}
      </p>

      {error && <p className="field-error">{error}</p>}

      {esAdmin && <LeyendaAcciones items={[{ icono: "bi-pencil-square", etiqueta: "Editar" }]} />}

      {cargando ? (
        <p>Cargando…</p>
      ) : canjes.length === 0 ? (
        <p>Todavía no hay canjes registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cédula</th>
              <th>Medicamento</th>
              <th>Plan</th>
              <th>Cantidad</th>
              <th>Farmacia</th>
              <th>Fecha</th>
              {esAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {canjes.map((canje) => (
              <Fragment key={canje.id}>
                <tr>
                  <td>{canje.cliente_detalle?.nombre}</td>
                  <td>{canje.cliente_detalle?.cedula}</td>
                  <td>{canje.medicamento_nombre}</td>
                  <td>{canje.plan_nombre}</td>
                  <td>{canje.cantidad}</td>
                  <td>{canje.farmacia_nombre}</td>
                  <td>{formatFechaHora(canje.fecha)}</td>
                  {esAdmin && (
                    <td>
                      <button
                        type="button"
                        className="btn-icon-only btn-secondary"
                        title={editandoId === canje.id ? "Cerrar" : "Editar"}
                        aria-label={editandoId === canje.id ? "Cerrar" : "Editar"}
                        onClick={() => setEditandoId(editandoId === canje.id ? null : canje.id)}
                      >
                        <i
                          className={editandoId === canje.id ? "bi bi-x-lg" : "bi bi-pencil-square"}
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  )}
                </tr>
                {editandoId === canje.id && (
                  <tr>
                    <td colSpan={8}>
                      <EditarCanjeForm
                        canje={canje}
                        farmacias={farmacias}
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

function EditarCanjeForm({
  canje,
  farmacias,
  onGuardado,
  onCancelar,
}: {
  canje: Canje;
  farmacias: Farmacia[];
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [fecha, setFecha] = useState(toDatetimeLocalValue(canje.fecha));
  const [farmaciaId, setFarmaciaId] = useState(String(canje.farmacia));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await actualizarCanje(canje.id, {
        fecha: new Date(fecha).toISOString(),
        farmacia: Number(farmaciaId),
      });
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form form-inline" style={{ padding: "1rem 0" }}>
      <p className="field-hint" style={{ flex: "0 0 100%" }}>
        Solo se puede corregir dónde y cuándo pasó el canje — no quién canjeó, qué plan ni la
        cantidad, porque eso sostiene la contabilidad del programa.
      </p>
      <label>
        Fecha y hora
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </label>
      <label>
        Farmacia
        <select value={farmaciaId} onChange={(e) => setFarmaciaId(e.target.value)} required>
          {farmacias.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
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

function AgregarCompra({
  esAdmin,
  farmacias,
  onRegistrado,
}: {
  esAdmin: boolean;
  farmacias: Farmacia[];
  onRegistrado: () => void;
}) {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaHecha, setBusquedaHecha] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estados, setEstados] = useState<EstadoCanje[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [farmaciaId, setFarmaciaId] = useState("");

  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    listarMedicamentos().then((r) => setMedicamentos(r.results));
  }, []);

  // Recomendaciones en vivo: busca a medida que se escribe (con un pequeño
  // debounce para no pegarle a la API en cada tecla), sin depender de que
  // se envíe el formulario.
  useEffect(() => {
    if (cliente) return;
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length < 2) {
      setResultados([]);
      setBusquedaHecha(false);
      return;
    }
    setBuscando(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const respuesta = await buscarClientes(terminoLimpio);
        setResultados(respuesta.results);
        setBusquedaHecha(true);
        setError(null);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [termino, cliente]);

  async function cargarDatosCliente(clienteId: number) {
    const [datosEstados, datosCompras] = await Promise.all([
      obtenerEstadoCanjes(clienteId),
      listarCompras({ cliente: clienteId }),
    ]);
    setEstados(datosEstados);
    setCompras(datosCompras.results);
  }

  async function seleccionarCliente(seleccionado: Cliente) {
    setCliente(seleccionado);
    setResultados([]);
    setBusquedaHecha(false);
    await cargarDatosCliente(seleccionado.id);
  }

  async function handleRegistrarCliente(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const nuevo = await crearCliente(nuevoNombre, termino);
      setNuevoNombre("");
      await seleccionarCliente(nuevo);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  function handleOtraBusqueda() {
    setCliente(null);
    setTermino("");
    setResultados([]);
    setBusquedaHecha(false);
    setEstados([]);
    setCompras([]);
  }

  return (
    <div className="card">
      {esAdmin && (
        <label>
          Atendiendo en nombre de la farmacia
          <select value={farmaciaId} onChange={(e) => setFarmaciaId(e.target.value)}>
            <option value="">Seleccioná una farmacia</option>
            {farmacias.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      {!cliente && (
        <div style={{ marginTop: esAdmin ? "1rem" : 0 }}>
          <div className="form">
            <label>
              Cédula o nombre del cliente
              <input
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                placeholder="Escribí para ver recomendaciones…"
                autoFocus
              />
            </label>
          </div>

          {error && <p className="field-error">{error}</p>}

          {buscando && <p className="field-hint">Buscando…</p>}

          {!buscando && busquedaHecha && resultados.length > 0 && (
            <ul className="planes-list">
              {resultados.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => seleccionarCliente(c)}>
                    {c.nombre} — {c.cedula}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!buscando && busquedaHecha && resultados.length === 0 && (
            <div>
              <p className="field-hint">
                No hay ningún cliente con "{termino}". Si es una cédula nueva, registralo:
              </p>
              <form onSubmit={handleRegistrarCliente} className="form">
                <label>
                  Nombre completo
                  <input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    required
                  />
                </label>
                <button type="submit">Registrar cliente con cédula "{termino}"</button>
              </form>
            </div>
          )}
        </div>
      )}

      {cliente && (
        <ClienteDetalle
          cliente={cliente}
          estados={estados}
          compras={compras}
          medicamentos={medicamentos}
          esAdmin={esAdmin}
          farmaciaId={farmaciaId}
          onCambioDeEstado={async () => {
            await cargarDatosCliente(cliente.id);
            onRegistrado();
          }}
          onOtroCliente={handleOtraBusqueda}
        />
      )}
    </div>
  );
}

function ClienteDetalle({
  cliente,
  estados,
  compras,
  medicamentos,
  esAdmin,
  farmaciaId,
  onCambioDeEstado,
  onOtroCliente,
}: {
  cliente: Cliente;
  estados: EstadoCanje[];
  compras: Compra[];
  medicamentos: Medicamento[];
  esAdmin: boolean;
  farmaciaId: string;
  onCambioDeEstado: () => void;
  onOtroCliente: () => void;
}) {
  const [medicamentoId, setMedicamentoId] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [canjeando, setCanjeando] = useState<number | null>(null);

  const faltaFarmacia = esAdmin && !farmaciaId;

  async function handleRegistrarCompra(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMensaje(null);
    if (faltaFarmacia) {
      setError("Seleccioná primero en nombre de qué farmacia estás atendiendo.");
      return;
    }
    setEnviando(true);
    try {
      await registrarCompra({
        cliente: cliente.id,
        medicamento: Number(medicamentoId),
        numero_factura: numeroFactura,
        cantidad: Number(cantidad),
        farmacia: esAdmin ? Number(farmaciaId) : undefined,
      });
      setNumeroFactura("");
      setCantidad("1");
      setMensaje("Compra registrada.");
      onCambioDeEstado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleCanjear(planId: number) {
    setError(null);
    setMensaje(null);
    if (faltaFarmacia) {
      setError("Seleccioná primero en nombre de qué farmacia estás atendiendo.");
      return;
    }
    setCanjeando(planId);
    try {
      await registrarCanje(cliente.id, planId, esAdmin ? Number(farmaciaId) : undefined);
      setMensaje("¡Canje registrado!");
      onCambioDeEstado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCanjeando(null);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>
          {cliente.nombre} — {cliente.cedula}
        </h2>
        <button type="button" onClick={onOtroCliente}>
          Atender otro cliente
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}
      {mensaje && <p className="field-hint">{mensaje}</p>}

      <div className="card">
        <h3>Estado del plan paciente</h3>
        {estados.length === 0 ? (
          <p className="field-hint">Este cliente todavía no tiene compras registradas.</p>
        ) : (
          <ul className="planes-list">
            {estados.map((estado) => (
              <li key={estado.plan_id}>
                <strong>
                  {estado.medicamento_nombre} — plan {estado.plan_nombre} (compra{" "}
                  {estado.cantidad_comprada}, llevate {estado.cantidad_gratis} gratis)
                </strong>
                <div>
                  Llevás acumuladas {estado.unidades_disponibles} de {estado.cantidad_comprada}{" "}
                  unidades necesarias.{" "}
                  {estado.aplica_canje ? (
                    <span className="badge badge-aprobada">
                      Aplica canje: {estado.cantidad_gratis} gratis
                    </span>
                  ) : (
                    <span className="badge badge-pendiente">
                      Te faltan {estado.unidades_para_proximo_canje} unidades más para el
                      próximo canje
                    </span>
                  )}
                </div>
                {estado.aplica_canje && (
                  <button
                    type="button"
                    disabled={canjeando === estado.plan_id}
                    onClick={() => handleCanjear(estado.plan_id)}
                  >
                    {canjeando === estado.plan_id ? "Canjeando…" : "Canjear"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Historial de compras</h3>
        {compras.length === 0 ? (
          <p className="field-hint">Sin compras registradas todavía.</p>
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
      </div>

      <div className="card card-narrow">
        <h3>Registrar compra</h3>
        {faltaFarmacia && (
          <p className="field-error">
            Seleccioná arriba en nombre de qué farmacia estás atendiendo.
          </p>
        )}
        <form onSubmit={handleRegistrarCompra} className="form">
          <label>
            Medicamento
            <select
              value={medicamentoId}
              onChange={(e) => setMedicamentoId(e.target.value)}
              required
            >
              <option value="">Seleccioná un medicamento</option>
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Número de factura
            <input
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              required
            />
          </label>
          <label>
            Cantidad
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={enviando || faltaFarmacia}>
            {enviando ? "Registrando…" : "Registrar compra"}
          </button>
        </form>
      </div>
    </div>
  );
}
