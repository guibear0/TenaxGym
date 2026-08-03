import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { WorkoutNotificationBell } from "../WorkoutNotifications";

export default function Navbar() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const isClient = userProfile?.role === "client";

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    window.location.href = "/login";
  };

  return (
    <nav className="w-full max-w-6xl px-4 py-4 flex items-center justify-end gap-6 sm:gap-8">
      {/* Botón de notificaciones exclusivo para clientes con separación limpia */}
      {isClient && (
        <div className="flex items-center">
          <WorkoutNotificationBell />
        </div>
      )}

      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm text-gray-100 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer"
        aria-label="Log out"
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold text-sm">Cerrar Sesión</span>
      </motion.button>
    </nav>
  );
}
