import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarConfiguracionSmtp,
  obtenerConfiguracionSmtp,
  probarConfiguracionSmtp,
} from "../api/configuracion";
import { extractErrorMessage } from "../api/client";

export function ConfiguracionSMTPPage() {
  const [host, setHost] = useState("");
  const [puerto, setPuerto] = useState("587");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfigurada, setPasswordConfigurada] = useState(false);
  const [usarTls, setUsarTls] = useState(true);
  const [fromEmail, setFromEmail] = useState("");
  const [estaConfigurado, setEstaConfigurado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [correoPrueba, setCorreoPrueba] = useState("");
  const [probando, setProbando] = useState(false);
  const [errorPrueba, setErrorPrueba] = useState<string | null>(null);
  const [mensajePrueba, setMensajePrueba] = useState<string | null>(null);

  useEffect(() => {
    obtenerConfiguracionSmtp()
      .then((config) => {
        setHost(config.host);
        setPuerto(String(config.puerto));
        setUsuario(config.usuario);
        setPasswordConfigurada(config.password_configurada);
        setUsarTls(config.usar_tls);
        setFromEmail(config.from_email);
        setEstaConfigurado(config.esta_configurado);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const config = await actualizarConfiguracionSmtp({
        host,
        puerto: Number(puerto),
        usuario,
        password: password || undefined,
        usar_tls: usarTls,
        from_email: fromEmail,
      });
      setPassword("");
      setPasswordConfigurada(config.password_configurada);
      setEstaConfigurado(config.esta_configurado);
      setMensaje("Configuración guardada.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGuardando(false);
    }
  }

  async function handleProbarSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorPrueba(null);
    setMensajePrueba(null);
    setProbando(true);
    try {
      const { detail } = await probarConfiguracionSmtp(correoPrueba);
      setMensajePrueba(detail);
    } catch (err) {
      setErrorPrueba(extractErrorMessage(err));
    } finally {
      setProbando(false);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <div>
      <h1>Configuración — servidor SMTP</h1>
      <p className="field-hint">
        Servidor de correo externo (Gmail, Outlook/Hotmail, u otro) usado para enviar los
        correos de la app (aprobación de farmacias, contraseñas temporales, rechazos). Sin
        configurar acá, se usa el backend de consola/`.env` por defecto.{" "}
        <strong>{estaConfigurado ? "Configurado." : "Sin configurar todavía."}</strong>
      </p>

      <div className="card card-narrow">
        <form onSubmit={handleSubmit} className="form">
          <label>
            Host SMTP
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="smtp.gmail.com"
              required
            />
          </label>
          <label>
            Puerto
            <input
              type="number"
              value={puerto}
              onChange={(e) => setPuerto(e.target.value)}
              required
            />
          </label>
          <label>
            Usuario
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="notificaciones@gmail.com"
              required
            />
          </label>
          <label>
            Contraseña{" "}
            {passwordConfigurada && (
              <span className="field-hint">(ya hay una guardada — dejá vacío para conservarla)</span>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordConfigurada ? "••••••••" : ""}
            />
          </label>
          <label>
            <input type="checkbox" checked={usarTls} onChange={(e) => setUsarTls(e.target.checked)} />{" "}
            Usar TLS
          </label>
          <label>
            Correo remitente
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="notificaciones@gmail.com"
              required
            />
          </label>

          {error && <p className="field-error">{error}</p>}
          {mensaje && <p className="field-hint">{mensaje}</p>}

          <button type="submit" className="btn-icon" disabled={guardando}>
            <i className="bi bi-check-lg" aria-hidden="true" />{" "}
            {guardando ? "Guardando…" : "Guardar configuración"}
          </button>
        </form>
      </div>

      <div className="card card-narrow">
        <h2>Correo de prueba</h2>
        <p className="field-hint">
          Envía un correo mínimo con la configuración actual, para confirmar que llega antes de
          depender de un correo real (aprobación/rechazo de farmacia).
        </p>
        <form onSubmit={handleProbarSubmit} className="form form-inline">
          <label>
            Enviar a
            <input
              type="email"
              value={correoPrueba}
              onChange={(e) => setCorreoPrueba(e.target.value)}
              placeholder="tu-correo@ejemplo.com"
              required
            />
          </label>
          <div className="actions">
            <button type="submit" className="btn-icon btn-secondary" disabled={probando}>
              <i className="bi bi-send" aria-hidden="true" />{" "}
              {probando ? "Enviando…" : "Enviar correo de prueba"}
            </button>
          </div>
        </form>
        {errorPrueba && <p className="field-error">{errorPrueba}</p>}
        {mensajePrueba && <p className="field-hint">{mensajePrueba}</p>}
      </div>
    </div>
  );
}
