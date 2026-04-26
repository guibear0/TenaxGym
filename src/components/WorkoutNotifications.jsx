/* eslint-disable */
/**
 * WorkoutNotifications.jsx
 *
 * Drop-in notification system that matches the existing app aesthetic.
 *
 * USAGE — wrap your app or page with <NotificationProvider> and call
 * useWorkoutNotifications() anywhere inside.
 *
 * Alternatively, use the standalone <WorkoutNotificationBell /> in a Navbar.
 *
 * Notifications are stored in localStorage so they persist across reloads.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Dumbbell, Ruler, Trophy, RefreshCw, ChevronRight, Check } from "lucide-react";

// ── Types & Icons ─────────────────────────────────────────────────────────────
const NOTIFICATION_ICONS = {
  routine_updated: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-900/50", border: "border-blue-500/40" },
  record_weight: { icon: Ruler, color: "text-purple-400", bg: "bg-purple-900/50", border: "border-purple-500/40" },
  achievement: { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-900/50", border: "border-yellow-500/40" },
  workout_reminder: { icon: Dumbbell, color: "text-green-400", bg: "bg-green-900/50", border: "border-green-500/40" },
  general: { icon: Bell, color: "text-gray-400", bg: "bg-gray-800/50", border: "border-gray-600/40" },
};

// ── Context ───────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

const STORAGE_KEY = "workout_notifications";

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToStorage(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => loadFromStorage());
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // Seed demo notifications on first load
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.length === 0) {
      const demo = [
        {
          id: crypto.randomUUID(),
          type: "routine_updated",
          title: "¡Tu entrenador ha actualizado tu rutina!",
          body: "Revisa los nuevos ejercicios del Día 3.",
          read: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "record_weight",
          title: "No olvides registrar tu peso hoy",
          body: "Mantén tu seguimiento al día para ver tu evolución.",
          read: false,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ];
      setNotifications(demo);
    }
  }, []);

  const push = useCallback((type, title, body) => {
    const n = {
      id: crypto.randomUUID(),
      type: type || "general",
      title,
      body,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [n, ...prev].slice(0, 30));

    // Toast
    const toastId = n.id;
    setToasts((prev) => [...prev, n]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, push, markRead, markAllRead, remove, unreadCount }}
    >
      {children}
      {/* Toast Stack */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const meta = NOTIFICATION_ICONS[toast.type] || NOTIFICATION_ICONS.general;
            const Icon = meta.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${meta.bg} ${meta.border} backdrop-blur-sm shadow-xl`}
              >
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${meta.bg}`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 leading-tight">{toast.title}</p>
                  {toast.body && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{toast.body}</p>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useWorkoutNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useWorkoutNotifications must be used inside <NotificationProvider>");
  return ctx;
}

// ── Notification Bell (drop into Navbar) ──────────────────────────────────────
export function WorkoutNotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useWorkoutNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "Ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm text-gray-100 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] flex flex-col bg-gray-900/95 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
              <span className="font-bold text-gray-100 text-sm">Notificaciones</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Marcar todo leído
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                  <Bell className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">Sin notificaciones</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((n) => {
                    const meta = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.general;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => markRead(n.id)}
                        className={`relative flex items-start gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/40 cursor-pointer transition group ${
                          !n.read ? "bg-gray-800/20" : ""
                        }`}
                      >
                        {/* Unread dot */}
                        {!n.read && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}

                        <div className={`flex-shrink-0 p-1.5 rounded-lg ${meta.bg} mt-0.5`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight ${n.read ? "text-gray-400" : "text-gray-100 font-semibold"}`}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                          )}
                          <p className="text-[10px] text-gray-600 mt-1">{formatTime(n.timestamp)}</p>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Standalone page (optional) ────────────────────────────────────────────────
export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, remove, unreadCount } = useWorkoutNotifications();

  const formatTime = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "Ahora mismo";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Marcar todo leído
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((n) => {
                const meta = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.general;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${
                      n.read
                        ? "border-gray-700/40 bg-gray-800/30 opacity-70"
                        : `${meta.border} ${meta.bg} backdrop-blur-sm`
                    }`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-xl ${meta.bg}`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${n.read ? "text-gray-400" : "text-gray-100"}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                      <p className="text-[11px] text-gray-600 mt-1">{formatTime(n.timestamp)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}