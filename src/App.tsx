import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Layout } from "./routes/Layout";
import { ProtectedRoute, RequireRole } from "./routes/ProtectedRoute";
import { ActivarCuentaPage } from "./pages/ActivarCuentaPage";
import { AdminFarmaciasPage } from "./pages/AdminFarmaciasPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MedicamentosPage } from "./pages/MedicamentosPage";
import { MiFarmaciaPage } from "./pages/MiFarmaciaPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegistroFarmaciaPage } from "./pages/RegistroFarmaciaPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegistroFarmaciaPage />} />
            <Route path="activar-cuenta" element={<ActivarCuentaPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="medicamentos" element={<MedicamentosPage />} />
            </Route>

            <Route element={<RequireRole rol="admin" />}>
              <Route path="admin/farmacias" element={<AdminFarmaciasPage />} />
            </Route>

            <Route element={<RequireRole rol="farmacia" />}>
              <Route path="mi-farmacia" element={<MiFarmaciaPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
