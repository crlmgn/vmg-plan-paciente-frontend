import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  huboError: boolean;
}

/** Red de seguridad ante un error de render que se escapó de los try/catch
 * de cada página (ver src/api/client.ts) — evita que la app entera quede en
 * blanco por una excepción no controlada. No reemplaza el manejo de errores
 * de cada página, solo cubre lo que se les escape. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { huboError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { huboError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la interfaz:", error, info);
  }

  render() {
    if (this.state.huboError) {
      return (
        <div className="card" style={{ margin: "2rem auto", maxWidth: 480, textAlign: "center" }}>
          <h1>Algo salió mal</h1>
          <p>
            Ocurrió un error inesperado. Probá recargar la página; si el problema persiste,
            contactá al equipo de soporte.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
