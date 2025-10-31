import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ClientDashboard from "./pages/dashboards/clients/ClientDashboard";
import TrainerDashboard from "./pages/dashboards/Trainer/TrainerDashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import Home from "./pages/Home";
import Clients from "./pages/dashboards/Trainer/Clients";
import DaySelector from "./pages/dashboards/clients/DaySelector";
import ExercisesAdmin from "./pages/dashboards/Trainer/ExercisesAdmin";
import Catalog from "./pages/dashboards/Trainer/CatalogManager";
import Measures from "./pages/dashboards/clients/Measures";
import Tests from "./pages/dashboards/clients/Tests";
import StrengthTest from "./pages/dashboards/clients/StrengthTest";
import MobilityTest from "./pages/dashboards/clients/MobilityTest";
import Sessions from "./pages/dashboards/Trainer/Sessions";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster /* ... tus configs ... */ />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ RUTAS PRIVADAS DEL CLIENTE */}
        <Route
          path="/client-dashboard"
          element={
            <PrivateRoute role="client">
              <ClientDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/day-selector"
          element={
            <PrivateRoute role="client">
              <DaySelector />
            </PrivateRoute>
          }
        />

        <Route
          path="/measures"
          element={
            <PrivateRoute role="client">
              <Measures />
            </PrivateRoute>
          }
        />

        <Route
          path="/tests"
          element={
            <PrivateRoute role="client">
              <Tests />
            </PrivateRoute>
          }
        />

        <Route
          path="/tests/strength"
          element={
            <PrivateRoute role="client">
              <StrengthTest />
            </PrivateRoute>
          }
        />

        <Route
          path="/tests/mobility"
          element={
            <PrivateRoute role="client">
              <MobilityTest />
            </PrivateRoute>
          }
        />

        {/* ✅ RUTAS PRIVADAS DEL ENTRENADOR */}
        <Route
          path="/trainer-dashboard"
          element={
            <PrivateRoute role="trainer">
              <TrainerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <PrivateRoute role="trainer">
              <Clients />
            </PrivateRoute>
          }
        />

        <Route
          path="/exercises-admin"
          element={
            <PrivateRoute role="trainer">
              <ExercisesAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <PrivateRoute role="trainer">
              <Catalog />
            </PrivateRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <PrivateRoute role="trainer">
              <Sessions />
            </PrivateRoute>
          }
        />

        {/* ✅ Perfil (cualquiera que esté logueado puede verlo) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
