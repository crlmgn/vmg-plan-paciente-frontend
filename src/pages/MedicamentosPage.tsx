import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarMedicamento,
  actualizarPlan,
  crearMedicamento,
  crearPlan,
  eliminarMedicamento,
  eliminarPlan,
  listarMedicamentos,
} from "../api/medicamentos";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { LeyendaAcciones } from "../components/LeyendaAcciones";
import type { Medicamento, Plan } from "../types";

export function MedicamentosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  function cargar() {
    setCargando(true);
    listarMedicamentos(busqueda || undefined)
      .then((r) => setMedicamentos(r.results))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargar, [busqueda]);

  async function handleEliminarMedicamento(medicamento: Medicamento) {
    if (!window.confirm(`¿Eliminar "${medicamento.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    try {
      await eliminarMedicamento(medicamento.id);
      cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="toolbar">
        <h1>Medicamentos y planes</h1>
        {esAdmin && (
          <button type="button" className="btn-icon" onClick={() => setCreando((v) => !v)}>
            {creando ? (
              <>
                <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg" aria-hidden="true" /> Agregar medicamento
              </>
            )}
          </button>
        )}
      </div>

      {creando && (
        <div className="card card-narrow">
          <FormMedicamento
            onGuardado={() => {
              setCreando(false);
              cargar();
            }}
            onCancelar={() => setCreando(false)}
          />
        </div>
      )}

      <input
        placeholder="Buscar medicamento…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {error && <p className="field-error">{error}</p>}

      {esAdmin && (
        <LeyendaAcciones
          items={[
            { icono: "bi-pencil-square", etiqueta: "Editar" },
            { icono: "bi-trash", etiqueta: "Eliminar" },
            { icono: "bi-plus-lg", etiqueta: "Agregar" },
          ]}
        />
      )}

      {cargando ? (
        <p>Cargando…</p>
      ) : medicamentos.length === 0 ? (
        <p>No hay medicamentos que coincidan con la búsqueda.</p>
      ) : (
        <div className="medicamentos-list">
          {medicamentos.map((med) => (
            <TarjetaMedicamento
              key={med.id}
              medicamento={med}
              esAdmin={esAdmin}
              onCambio={cargar}
              onEliminar={() => handleEliminarMedicamento(med)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaMedicamento({
  medicamento,
  esAdmin,
  onCambio,
  onEliminar,
}: {
  medicamento: Medicamento;
  esAdmin: boolean;
  onCambio: () => void;
  onEliminar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [agregandoPlan, setAgregandoPlan] = useState(false);

  const planes = esAdmin ? medicamento.planes : medicamento.planes.filter((p) => p.activo);

  return (
    <div className="card">
      {editando ? (
        <FormMedicamento
          medicamento={medicamento}
          inline
          onGuardado={() => {
            setEditando(false);
            onCambio();
          }}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <div className="toolbar">
            <h2 style={{ margin: 0 }}>{medicamento.nombre}</h2>
            <div className="actions">
              {!medicamento.activo && <span className="badge badge-rechazada">inactivo</span>}
              {esAdmin && (
                <>
                  <button
                    type="button"
                    className="btn-icon-only btn-secondary"
                    title="Editar"
                    aria-label="Editar"
                    onClick={() => setEditando(true)}
                  >
                    <i className="bi bi-pencil-square" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-only btn-danger"
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={onEliminar}
                  >
                    <i className="bi bi-trash" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
          {(medicamento.fuerza_mg || medicamento.presentacion || medicamento.cantidad) && (
            <p className="field-hint">
              {[
                medicamento.fuerza_mg ? `${medicamento.fuerza_mg}mg` : null,
                medicamento.cantidad && medicamento.presentacion
                  ? `${medicamento.cantidad} ${medicamento.presentacion}`
                  : (medicamento.presentacion ?? null),
              ]
                .filter(Boolean)
                .join(" — ")}
            </p>
          )}
          {medicamento.descripcion && <p>{medicamento.descripcion}</p>}
        </>
      )}

      {planes.length === 0 ? (
        <p className="field-hint">Sin planes {esAdmin ? "" : "activos"}.</p>
      ) : (
        <ul className="planes-list">
          {planes.map((plan) => (
            <ItemPlan
              key={plan.id}
              plan={plan}
              medicamentoId={medicamento.id}
              esAdmin={esAdmin}
              onCambio={onCambio}
            />
          ))}
        </ul>
      )}

      {esAdmin && (
        <div style={{ marginTop: "0.75rem" }}>
          {agregandoPlan ? (
            <FormPlan
              medicamentoId={medicamento.id}
              onGuardado={() => {
                setAgregandoPlan(false);
                onCambio();
              }}
              onCancelar={() => setAgregandoPlan(false)}
            />
          ) : (
            <button
              type="button"
              className="btn-icon-only"
              title="Agregar plan"
              aria-label="Agregar plan"
              onClick={() => setAgregandoPlan(true)}
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ItemPlan({
  plan,
  medicamentoId,
  esAdmin,
  onCambio,
}: {
  plan: Plan;
  medicamentoId: number;
  esAdmin: boolean;
  onCambio: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
    setError(null);
    try {
      await eliminarPlan(medicamentoId, plan.id);
      onCambio();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (editando) {
    return (
      <li>
        <FormPlan
          medicamentoId={medicamentoId}
          plan={plan}
          onGuardado={() => {
            setEditando(false);
            onCambio();
          }}
          onCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li>
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div>
          <strong>{plan.nombre}</strong>
          {plan.descripcion && ` — ${plan.descripcion}`}
          <div className="field-hint">
            compra {plan.cantidad_comprada}, llevate {plan.cantidad_gratis} gratis
          </div>
        </div>
        <div className="actions">
          {!plan.activo && <span className="badge badge-rechazada">inactivo</span>}
          {esAdmin && (
            <>
              <button
                type="button"
                className="btn-icon-only btn-secondary"
                title="Editar"
                aria-label="Editar"
                onClick={() => setEditando(true)}
              >
                <i className="bi bi-pencil-square" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-icon-only btn-danger"
                title="Eliminar"
                aria-label="Eliminar"
                onClick={handleEliminar}
              >
                <i className="bi bi-trash" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
    </li>
  );
}

function FormMedicamento({
  medicamento,
  inline = false,
  onGuardado,
  onCancelar,
}: {
  medicamento?: Medicamento;
  inline?: boolean;
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState(medicamento?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(medicamento?.descripcion ?? "");
  const [presentacion, setPresentacion] = useState(medicamento?.presentacion ?? "");
  const [cantidad, setCantidad] = useState(
    medicamento?.cantidad != null ? String(medicamento.cantidad) : "",
  );
  const [fuerzaMg, setFuerzaMg] = useState(
    medicamento?.fuerza_mg != null ? String(medicamento.fuerza_mg) : "",
  );
  const [activo, setActivo] = useState(medicamento?.activo ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    const payload = {
      nombre,
      descripcion,
      presentacion,
      cantidad: cantidad === "" ? null : Number(cantidad),
      fuerza_mg: fuerzaMg === "" ? null : Number(fuerzaMg),
      activo,
    };
    try {
      if (medicamento) {
        await actualizarMedicamento(medicamento.id, payload);
      } else {
        await crearMedicamento(payload);
      }
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={inline ? "form form-inline" : "form"}>
      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>
      <label>
        Descripción
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </label>
      <label>
        Presentación
        <input
          value={presentacion}
          onChange={(e) => setPresentacion(e.target.value)}
          placeholder="cápsulas, tabletas…"
        />
      </label>
      <label>
        Cantidad
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="30"
        />
      </label>
      <label>
        Fuerza (mg)
        <input
          type="number"
          min={1}
          value={fuerzaMg}
          onChange={(e) => setFuerzaMg(e.target.value)}
          placeholder="300"
        />
      </label>
      {medicamento && (
        <label>
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />{" "}
          Activo
        </label>
      )}
      {error && <p className="field-error">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn-icon" disabled={guardando}>
          <i className="bi bi-check-lg" aria-hidden="true" /> {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          className="btn-icon btn-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
        </button>
      </div>
    </form>
  );
}

function FormPlan({
  medicamentoId,
  plan,
  onGuardado,
  onCancelar,
}: {
  medicamentoId: number;
  plan?: Plan;
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState(plan?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(plan?.descripcion ?? "");
  const [cantidadComprada, setCantidadComprada] = useState(
    String(plan?.cantidad_comprada ?? 2),
  );
  const [cantidadGratis, setCantidadGratis] = useState(String(plan?.cantidad_gratis ?? 1));
  const [activo, setActivo] = useState(plan?.activo ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    const payload = {
      nombre,
      descripcion,
      cantidad_comprada: Number(cantidadComprada),
      cantidad_gratis: Number(cantidadGratis),
      activo,
    };
    try {
      if (plan) {
        await actualizarPlan(medicamentoId, plan.id, payload);
      } else {
        await crearPlan(medicamentoId, payload);
      }
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form form-inline">
      <label>
        Nombre del plan (ej. "2+1")
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>
      <label>
        Descripción
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </label>
      <label>
        Cantidad comprada
        <input
          type="number"
          min={1}
          value={cantidadComprada}
          onChange={(e) => setCantidadComprada(e.target.value)}
          required
        />
      </label>
      <label>
        Cantidad gratis
        <input
          type="number"
          min={1}
          value={cantidadGratis}
          onChange={(e) => setCantidadGratis(e.target.value)}
          required
        />
      </label>
      {plan && (
        <label>
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />{" "}
          Activo
        </label>
      )}
      {error && <p className="field-error">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn-icon" disabled={guardando}>
          <i className="bi bi-check-lg" aria-hidden="true" /> {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          className="btn-icon btn-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
        </button>
      </div>
    </form>
  );
}
