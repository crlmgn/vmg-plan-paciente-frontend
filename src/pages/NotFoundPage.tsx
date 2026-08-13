import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="card">
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
