import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { checkEmail, registrarFarmacia } from "../api/farmacias";
import { extractErrorMessage } from "../api/client";
import { listarCantones, listarDistritos, listarProvincias } from "../api/ubicaciones";
import type { Canton, Distrito, Provincia } from "../types";

export function RegistroFarmaciaPage() {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [distritoId, setDistritoId] = useState("");

  const [avisoCorreo, setAvisoCorreo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    listarProvincias().then(setProvincias).catch(() => setError("No se pudo cargar el catálogo de ubicaciones."));
  }, []);

  useEffect(() => {
    setCantonId("");
    setDistritoId("");
    setCantones([]);
    if (!provinciaId) return;
    listarCantones(Number(provinciaId)).then(setCantones);
  }, [provinciaId]);

  useEffect(() => {
    setDistritoId("");
    setDistritos([]);
    if (!cantonId) return;
    listarDistritos(Number(cantonId)).then(setDistritos);
  }, [cantonId]);

  async function handleCorreoBlur() {
    setAvisoCorreo(null);
    if (!correo) return;
    try {
      const { existe, estado } = await checkEmail(correo);
      if (existe) {
        setAvisoCorreo(
          estado === "pendiente"
            ? "Ya existe una solicitud pendiente de revisión con este correo."
            : estado === "aprobada"
              ? "Este correo ya pertenece a una farmacia aprobada. Iniciá sesión en vez de registrarte de nuevo."
              : "Este correo tiene una solicitud rechazada. Contactá al equipo de Plan Paciente.",
        );
      }
    } catch {
      // Ayuda de UX best-effort: si falla, no bloqueamos el registro.
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrarFarmacia({
        nombre,
        correo_contacto: correo,
        telefono,
        provincia: Number(provinciaId),
        canton: Number(cantonId),
        distrito: Number(distritoId),
      });
      setEnviado(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="card">
        <h1>¡Solicitud enviada!</h1>
        <p>
          Te contactaremos por correo a <strong>{correo}</strong> cuando el equipo de Plan
          Paciente revise tu solicitud.
        </p>
        <Link to="/login">Volver al inicio de sesión</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Registro de farmacia — Plan Paciente</h1>
      <p>Completá los datos de tu farmacia. Un administrador revisará la solicitud.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre de la farmacia
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>

        <label>
          Correo del regente / encargado del plan paciente
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={handleCorreoBlur}
            required
          />
        </label>
        {avisoCorreo && <p className="field-hint">{avisoCorreo}</p>}

        <label>
          Teléfono
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </label>

        <label>
          Provincia
          <select value={provinciaId} onChange={(e) => setProvinciaId(e.target.value)} required>
            <option value="">Seleccioná una provincia</option>
            {provincias.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantón
          <select
            value={cantonId}
            onChange={(e) => setCantonId(e.target.value)}
            disabled={!provinciaId}
            required
          >
            <option value="">Seleccioná un cantón</option>
            {cantones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Distrito
          <select
            value={distritoId}
            onChange={(e) => setDistritoId(e.target.value)}
            disabled={!cantonId}
            required
          >
            <option value="">Seleccioná un distrito</option>
            {distritos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar solicitud"}
        </button>
      </form>

      <p>
        ¿Ya tenés una cuenta activa? <Link to="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}
