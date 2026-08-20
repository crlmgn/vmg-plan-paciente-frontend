import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarMensaje,
  crearMensaje,
  eliminarMensaje,
  listarMensajes,
  type MensajePayload,
} from "../api/mensajes";
import { extractErrorMessage } from "../api/client";
import { LeyendaAcciones } from "../components/LeyendaAcciones";
import { comoArray } from "../utils/arrays";
import type { Mensaje, TipoMensaje } from "../types";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** El input datetime-local espera "YYYY-MM-DDTHH:mm" en hora local, sin
 * offset — el ISO que manda el backend ya viene en hora local (con offset),
 * así que alcanza con cortar los primeros 16 caracteres. */
function paraInputFecha(iso: string | null): string {
  return iso ? iso.slice(0, 16) : "";
}

export function AdminMensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  function cargar() {
    setCargando(true);
    listarMensajes()
      .then((r) => setMensajes(comoArray<Mensaje>(r.results)))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargar, []);

  async function handleEliminar(mensaje: Mensaje) {
    if (!window.confirm(`¿Eliminar el mensaje "${mensaje.texto}"?`)) return;
    setError(null);
    try {
      await eliminarMensaje(mensaje.id);
      cargar();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="toolbar">
        <h1>Mensajes y ofertas</h1>
        <button type="button" className="btn-icon" onClick={() => setCreando((v) => !v)}>
          {creando ? (
            <>
              <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg" aria-hidden="true" /> Agregar mensaje
            </>
          )}
        </button>
      </div>

      <p className="field-hint">
        Los mensajes activos se muestran en el cintillo debajo del header a todos los usuarios,
        estén o no logueados.
      </p>

      {creando && (
        <div className="card card-narrow">
          <FormMensaje
            onGuardado={() => {
              setCreando(false);
              cargar();
            }}
            onCancelar={() => setCreando(false)}
          />
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      <LeyendaAcciones
        items={[
          { icono: "bi-pencil-square", etiqueta: "Editar" },
          { icono: "bi-trash", etiqueta: "Eliminar" },
        ]}
      />

      {cargando ? (
        <p>Cargando…</p>
      ) : mensajes.length === 0 ? (
        <p>Todavía no hay mensajes creados.</p>
      ) : (
        <div className="medicamentos-list">
          {mensajes.map((mensaje) => (
            <TarjetaMensaje
              key={mensaje.id}
              mensaje={mensaje}
              onCambio={cargar}
              onEliminar={() => handleEliminar(mensaje)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaMensaje({
  mensaje,
  onCambio,
  onEliminar,
}: {
  mensaje: Mensaje;
  onCambio: () => void;
  onEliminar: () => void;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="card">
        <FormMensaje
          mensaje={mensaje}
          onGuardado={() => {
            setEditando(false);
            onCambio();
          }}
          onCancelar={() => setEditando(false)}
        />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div>
          <span className={mensaje.tipo === "oferta" ? "badge badge-aprobada" : "badge badge-pendiente"}>
            {mensaje.tipo === "oferta" ? "Oferta" : "Aviso"}
          </span>
          {!mensaje.activo && <span className="badge badge-rechazada">inactivo</span>}
          <p
            className="mensaje-texto-editable"
            style={{ margin: "0.5rem 0 0" }}
            onClick={() => setEditando(true)}
            title="Clic para editar"
          >
            {mensaje.texto}
          </p>
          {(mensaje.fecha_inicio || mensaje.fecha_fin) && (
            <p className="field-hint" style={{ margin: "0.35rem 0 0" }}>
              {mensaje.fecha_inicio ? `Desde ${formatearFecha(mensaje.fecha_inicio)}` : "Sin inicio"}
              {" — "}
              {mensaje.fecha_fin ? `hasta ${formatearFecha(mensaje.fecha_fin)}` : "sin expiración"}
            </p>
          )}
        </div>
        <div className="actions">
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
        </div>
      </div>
    </div>
  );
}

function FormMensaje({
  mensaje,
  onGuardado,
  onCancelar,
}: {
  mensaje?: Mensaje;
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [texto, setTexto] = useState(mensaje?.texto ?? "");
  const [tipo, setTipo] = useState<TipoMensaje>(mensaje?.tipo ?? "aviso");
  const [activo, setActivo] = useState(mensaje?.activo ?? true);
  const [fechaInicio, setFechaInicio] = useState(paraInputFecha(mensaje?.fecha_inicio ?? null));
  const [fechaFin, setFechaFin] = useState(paraInputFecha(mensaje?.fecha_fin ?? null));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    const payload: MensajePayload = {
      texto,
      tipo,
      activo,
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
    };
    try {
      if (mensaje) {
        await actualizarMensaje(mensaje.id, payload);
      } else {
        await crearMensaje(payload);
      }
      onGuardado();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Mensaje
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Ej. 2x1 en Losartán 50mg toda esta semana"
          required
        />
      </label>
      <label>
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMensaje)}>
          <option value="aviso">Aviso</option>
          <option value="oferta">Oferta</option>
        </select>
      </label>
      <p className="field-hint" style={{ marginTop: "-0.5rem" }}>
        <strong>Aviso</strong>: anuncios generales (ícono de megáfono), ej. cambios de horario.{" "}
        <strong>Oferta</strong>: promociones o descuentos (ícono de regalo), se resalta distinto en
        el cintillo.
      </p>
      <label>
        Fecha de inicio (opcional)
        <input
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </label>
      <label>
        Fecha de expiración (opcional)
        <input
          type="datetime-local"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </label>
      {mensaje && (
        <label>
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />{" "}
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
