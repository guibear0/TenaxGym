import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const user = localStorage.getItem("userProfile");

  // ❌ No hay sesión → redirect a login
  if (!user) return <Navigate to="/login" />;

  const u = JSON.parse(user);

  // ✅ Si la ruta requiere trainer
  if (role === "trainer" && !u.is_trainer) {
    return <Navigate to="/client-dashboard" />;
  }

  // ✅ Si la ruta requiere cliente
  if (role === "client" && u.is_trainer) {
    return <Navigate to="/trainer-dashboard" />;
  }

  return children;
}
