import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { activarCuenta } from "../api/auth";
import { extractErrorMessage } from "../api/client";

export function ActivarCuentaPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [activada, setActivada] = useState(false);

  if (!uid || !token) {
    return (
      <div className="card card-narrow">
        <h1>Link de activación inválido</h1>
        <p>Revisá que copiaste el link completo desde el correo que te enviamos.</p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await activarCuenta(uid, token, password);
      setActivada(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  if (activada) {
    return (
      <div className="card card-narrow">
        <h1>Cuenta activada</h1>
        <p>Ya podés iniciar sesión con tu correo y la contraseña que acabás de definir.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="card card-narrow">
      <h1>Activar cuenta</h1>
      <p>Tu farmacia fue aprobada. Definí una contraseña para poder iniciar sesión.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
          />
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Activando…" : "Activar cuenta"}
        </button>
      </form>
    </div>
  );
}
