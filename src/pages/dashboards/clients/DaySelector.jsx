/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ClientExercisesDay from "./Exercises";
import BackButton from "../../../components/ui/BackButton";
import { CheckCheck } from "lucide-react";

export default function DaySelector() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [trainingDays, setTrainingDays] = useState(5);
  const [completedToday, setCompletedToday] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userName = userProfile?.name || "";
  const clientId = userProfile?.id;

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar training_days
        const { data: clientData } = await supabase
          .from("clientes")
          .select("training_days")
          .eq("id_cliente", clientId)
          .single();

        if (clientData?.training_days) {
          setTrainingDays(clientData.training_days);
        }

        // Cargar sesiones completadas hoy
        const today = new Date().toISOString().split("T")[0];
        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("numero_dia, completed")
          .eq("client_id", clientId)
          .eq("fecha", today)
          .eq("completed", true);

        if (sessions?.length > 0) {
          setCompletedToday(new Set(sessions.map((s) => s.numero_dia)));
        }
      } catch (_) {}
      setLoading(false);
    };

    fetchData();
  }, [clientId]);

  const days = Array.from({ length: trainingDays }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <BackButton label="Atrás" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {userName ? `${userName}` : "!"} ¡Mira tus ejercicios por día!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8"
        >
          {/* Selector de días */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-gray-700/50 animate-pulse" />
                ))
              : days.map((day) => (
                  <div key={day} className="relative">
                    <motion.button
                      onClick={() => setSelectedDay(day)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer w-12 h-12 rounded-lg font-semibold text-lg ${
                        selectedDay === day
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-white"
                      } transition-all duration-50`}
                      aria-label={`Seleccionar Día ${day}`}
                    >
                      {day}
                    </motion.button>
                    {/* Indicador de completado */}
                    {completedToday.has(day) && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                        <CheckCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
          </div>

          {/* Indicador del día completado */}
          {completedToday.has(selectedDay) && (
            <div className="flex items-center justify-center gap-2 mb-4 bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-2">
              <CheckCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                Sesión del Día {selectedDay} completada hoy
              </span>
            </div>
          )}

          {/* Mostrar ejercicios del día seleccionado */}
          <ClientExercisesDay day={selectedDay} />
        </motion.div>
      </div>
    </div>
  );
}