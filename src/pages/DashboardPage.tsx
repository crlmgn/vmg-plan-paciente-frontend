import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { descargarCanjesCSV, obtenerResumenDashboard } from "../api/dashboard";
import { extractErrorMessage } from "../api/client";
import { comoArray } from "../utils/arrays";
import type { ResumenDashboard, SerieMensual, TopCliente, TopFarmacia, TopMedicamento } from "../types";

const COLORES = [
  "#3f6dc9",
  "#38b28e",
  "#e0a83f",
  "#d1604e",
  "#8460c9",
  "#4aa3c9",
  "#c9608e",
  "#7fb23f",
  "#c98f3f",
  "#5f6d8e",
];

function formatearMes(mes: string): string {
  const [anio, numeroMes] = mes.split("-");
  const nombres = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${nombres[Number(numeroMes) - 1]} ${anio.slice(2)}`;
}

export function DashboardPage() {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    obtenerResumenDashboard()
      .then(setResumen)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setCargando(false));
  }, []);

  async function handleDescargarCSV() {
    setError(null);
    setDescargando(true);
    try {
      await descargarCanjesCSV();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDescargando(false);
    }
  }

  if (cargando) return <p>Cargando…</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (!resumen) return null;

  const canjesPorMes = comoArray<SerieMensual>(resumen.canjes_por_mes).map((s) => ({
    ...s,
    mes: formatearMes(s.mes),
  }));
  const comprasPorMes = comoArray<SerieMensual>(resumen.compras_por_mes).map((s) => ({
    ...s,
    mes: formatearMes(s.mes),
  }));
  const topMedicamentos = comoArray<TopMedicamento>(resumen.top_medicamentos);
  const topFarmacias = comoArray<TopFarmacia>(resumen.top_farmacias);
  const topClientes = comoArray<TopCliente>(resumen.top_clientes);

  return (
    <div>
      <div className="toolbar">
        <h1>Dashboard</h1>
        <button
          type="button"
          className="btn-icon"
          onClick={handleDescargarCSV}
          disabled={descargando}
        >
          <i className="bi bi-download" aria-hidden="true" />{" "}
          {descargando ? "Descargando…" : "Descargar CSV de canjes"}
        </button>
      </div>

      <div className="dashboard-totales">
        <div className="card dashboard-total-card">
          <span className="dashboard-total-valor">{resumen.totales.clientes}</span>
          <span className="dashboard-total-etiqueta">Clientes</span>
        </div>
        <div className="card dashboard-total-card">
          <span className="dashboard-total-valor">{resumen.totales.farmacias_aprobadas}</span>
          <span className="dashboard-total-etiqueta">Farmacias aprobadas</span>
        </div>
        <div className="card dashboard-total-card">
          <span className="dashboard-total-valor">{resumen.totales.compras}</span>
          <span className="dashboard-total-etiqueta">Compras registradas</span>
        </div>
        <div className="card dashboard-total-card">
          <span className="dashboard-total-valor">{resumen.totales.canjes}</span>
          <span className="dashboard-total-etiqueta">Canjes realizados</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-chart-card">
          <h3>Canjes por mes</h3>
          {canjesPorMes.length === 0 ? (
            <p className="field-hint">Todavía no hay canjes registrados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={canjesPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  name="Canjes"
                  stroke={COLORES[0]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <h3>Compras por mes</h3>
          {comprasPorMes.length === 0 ? (
            <p className="field-hint">Todavía no hay compras registradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={comprasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  name="Compras"
                  stroke={COLORES[1]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <h3>Medicamentos más canjeados</h3>
          {topMedicamentos.length === 0 ? (
            <p className="field-hint">Sin datos todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topMedicamentos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="medicamento" width={140} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Canjes" fill={COLORES[2]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <h3>Farmacias con más canjes</h3>
          {topFarmacias.length === 0 ? (
            <p className="field-hint">Sin datos todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={topFarmacias}
                  dataKey="cantidad"
                  nameKey="farmacia"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {topFarmacias.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card dashboard-chart-card dashboard-chart-card--ancho">
          <h3>Clientes con más canjes</h3>
          {topClientes.length === 0 ? (
            <p className="field-hint">Sin datos todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topClientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cliente" tick={{ fontSize: 11 }} interval={0} angle={-20} dy={10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Canjes" fill={COLORES[4]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
