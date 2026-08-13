import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { checkEmail, registrarFarmacia } from "../api/farmacias";
import { extractErrorMessage } from "../api/client";
import { UbicacionSelects } from "../components/UbicacionSelects";

export function RegistroFarmaciaPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccionExacta, setDireccionExacta] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [distritoId, setDistritoId] = useState("");

  const [avisoCorreo, setAvisoCorreo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

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
        direccion_exacta: direccionExacta,
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
            placeholder="Señas puntuales: calle, número, punto de referencia…"
            rows={3}
            required
          />
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
