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

function App() {
  return (
    <BrowserRouter>
      {/* Toaster global con estilos simplificados */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(31, 41, 55, 0.9)", // Gray-800 con transparencia
            backdropFilter: "blur(12px)",
            color: "#fff",
            border: "1px solid rgba(75, 85, 99, 0.4)", // Gray-600 border
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e", // verde success
              secondary: "#ffffff",
            },
            style: {
              background: "rgba(22, 101, 52, 0.9)", // verde oscuro
              border: "1px solid rgba(34, 197, 94, 0.5)",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // rojo error
              secondary: "#ffffff",
            },
            style: {
              background: "rgba(127, 29, 29, 0.9)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/day-selector" element={<DaySelector />} />
        <Route path="/exercises-admin" element={<ExercisesAdmin />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/measures" element={<Measures />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/tests/strength" element={<StrengthTest />} />
        <Route path="/tests/mobility" element={<MobilityTest />} />
        <Route path="/sessions" element={<Sessions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
