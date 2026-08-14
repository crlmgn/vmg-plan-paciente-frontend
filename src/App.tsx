import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./routes/Layout";
import { ProtectedRoute, RequireRole } from "./routes/ProtectedRoute";
import { ActivarCuentaPage } from "./pages/ActivarCuentaPage";
import { AdminFarmaciasPage } from "./pages/AdminFarmaciasPage";
import { CanjesPage } from "./pages/CanjesPage";
import { ClientesPage } from "./pages/ClientesPage";
import { ConfiguracionSMTPPage } from "./pages/ConfiguracionSMTPPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MedicamentosPage } from "./pages/MedicamentosPage";
import { MiFarmaciaPage } from "./pages/MiFarmaciaPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegistroFarmaciaPage } from "./pages/RegistroFarmaciaPage";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegistroFarmaciaPage />} />
              <Route path="activar-cuenta" element={<ActivarCuentaPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="medicamentos" element={<MedicamentosPage />} />
                <Route path="canjes" element={<CanjesPage />} />
              </Route>

              <Route element={<RequireRole rol="admin" />}>
                <Route path="admin/dashboard" element={<DashboardPage />} />
                <Route path="admin/farmacias" element={<AdminFarmaciasPage />} />
                <Route path="admin/clientes" element={<ClientesPage />} />
                <Route path="admin/configuracion" element={<ConfiguracionSMTPPage />} />
              </Route>

              <Route element={<RequireRole rol="farmacia" />}>
                <Route path="mi-farmacia" element={<MiFarmaciaPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
