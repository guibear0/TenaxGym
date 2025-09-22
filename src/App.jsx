import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Catalog from "./pages/dashboards/Trainer/Catalog";
import Measures from "./pages/dashboards/clients/Measures";

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/day-selector" element={<DaySelector/>} />
        <Route path="/exercises-admin" element={<ExercisesAdmin />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/measures" element={<Measures />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
