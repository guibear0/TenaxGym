/* eslint-disable */
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Brain,
  Moon,
  Smile,
  MessageSquare,
  ArrowLeft,
  CheckCheck,
  CalendarDays,
  Dumbbell,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * ClientWorkoutHistory
 * Shows an interactive calendar and log history for a client's workout sessions.
 * Props:
 *   clientId: UUID of the client
 *   onBack: optional callback to return to previous view
 */
export default function ClientWorkoutHistory({ clientId, onBack }) {
  const [clientProfile, setClientProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch client profile
  useEffect(() => {
    if (!clientId) return;
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", clientId)
          .single();
        if (data) setClientProfile(data);
      } catch (_) {}
    };
    fetchProfile();
  }, [clientId]);

  // Fetch workout sessions
  useEffect(() => {
    if (!clientId) return;
    fetchSessions();
  }, [clientId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("client_id", clientId)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      toast.error("Error al cargar historial de sesiones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Map of date string "YYYY-MM-DD" -> array of sessions
  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.fecha]) map[s.fecha] = [];
      map[s.fecha].push(s);
    });
    return map;
  }, [sessions]);

  // Calendar math for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Date(year, month, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const calendarGrid = useMemo(() => {
    const grid = [];
    // Padding days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      grid.push({ dayNumber: d, dateStr });
    }
    return grid;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Selected date sessions
  const selectedSessions = sessionsByDate[selectedDateStr] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Top Header */}
      {onBack && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a clientes
          </button>
        </div>
      )}

      {clientProfile && (
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
            Historial de Sesiones de{" "}
            <span className="text-blue-400">{clientProfile.name}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Calendario de entrenamientos, test previo y comentarios finales
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CALENDAR (7 cols on large, 12 on small) */}
        <div className="lg:col-span-7 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/60 shadow-xl">
          {/* Month controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-gray-700/60 hover:bg-gray-600 text-gray-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold capitalize text-blue-300 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {monthName}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-gray-700/60 hover:bg-gray-600 text-gray-200 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-gray-400 mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-11 sm:h-13 rounded-xl" />;
              }

              const daySessions = sessionsByDate[cell.dateStr] || [];
              const hasCompleted = daySessions.some((s) => s.completed);
              const hasIncomplete = daySessions.some((s) => !s.completed);
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`h-11 sm:h-13 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all duration-150 cursor-pointer relative ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold ring-2 ring-blue-400 scale-105 shadow-md"
                      : "bg-gray-900/60 hover:bg-gray-700/60 text-gray-200"
                  }`}
                >
                  <span className="text-xs font-semibold">{cell.dayNumber}</span>

                  <div className="flex gap-1 items-center mb-0.5">
                    {hasCompleted && (
                      <span className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400" />
                    )}
                    {!hasCompleted && hasIncomplete && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-5 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span>Sesión completada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Sesión iniciada</span>
            </div>
          </div>
        </div>

        {/* DETAILS FOR SELECTED DATE (5 cols on large) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/60 shadow-xl">
            <h3 className="text-lg font-bold text-gray-100 mb-3 flex items-center gap-2 border-b border-gray-700/50 pb-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              Detalle del {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>

            {selectedSessions.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-6 text-center">
                No hay sesiones registradas para esta fecha.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`rounded-xl p-4 border space-y-3 ${
                      sess.completed
                        ? "border-green-500/50 bg-green-950/20"
                        : "border-amber-500/50 bg-amber-950/20"
                    }`}
                  >
                    {/* Status & Day Header */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-100 flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-blue-400" />
                        Día {sess.numero_dia}
                      </span>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          sess.completed
                            ? "bg-green-900/60 text-green-300 border border-green-700/50"
                            : "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                        }`}
                      >
                        {sess.completed ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" /> Completada
                          </>
                        ) : (
                          <>Iniciada</>
                        )}
                      </span>
                    </div>

                    {/* Hour completed */}
                    {sess.completed_at && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Finalizada a las{" "}
                        {new Date(sess.completed_at).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    {/* Test Previo (1-5) */}
                    {(sess.fatigue > 0 || sess.sleep > 0 || sess.mood > 0) && (
                      <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/50 space-y-2">
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                          Test Previo de Estado
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-gray-800 p-2 rounded-lg">
                            <Brain className="w-4 h-4 text-red-400 mx-auto mb-1" />
                            <span className="text-gray-400 block text-[10px]">Cansancio</span>
                            <span className="font-bold text-red-400 text-sm">
                              {sess.fatigue || "—"}/5
                            </span>
                          </div>

                          <div className="bg-gray-800 p-2 rounded-lg">
                            <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                            <span className="text-gray-400 block text-[10px]">Sueño</span>
                            <span className="font-bold text-indigo-400 text-sm">
                              {sess.sleep || "—"}/5
                            </span>
                          </div>

                          <div className="bg-gray-800 p-2 rounded-lg">
                            <Smile className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                            <span className="text-gray-400 block text-[10px]">Ánimo</span>
                            <span className="font-bold text-yellow-400 text-sm">
                              {sess.mood || "—"}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comentarios Finales */}
                    {sess.final_comments && (
                      <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-700/50">
                        <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Comentarios finales del cliente:
                        </p>
                        <p className="text-xs text-gray-300 italic">
                          "{sess.final_comments}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ALL RECENT SESSIONS TIMELINE */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/60 shadow-xl max-h-96 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2 border-b border-gray-700/50 pb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Histórico Reciente de Sesiones
            </h3>

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Cargando...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No hay ninguna sesión registrada todavía.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedDateStr(s.fecha)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      s.fecha === selectedDateStr
                        ? "bg-blue-900/40 border-blue-500 text-white font-bold"
                        : "bg-gray-900/40 border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-100">
                        Día {s.numero_dia} ·{" "}
                        {new Date(s.fecha + "T12:00:00").toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      {s.final_comments && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                          "{s.final_comments}"
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        s.completed
                          ? "bg-green-900/60 text-green-300"
                          : "bg-amber-900/60 text-amber-300"
                      }`}
                    >
                      {s.completed ? "Completada" : "Iniciada"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
