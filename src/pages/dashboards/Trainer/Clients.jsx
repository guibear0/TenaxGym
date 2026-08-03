import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ClientExercisesAdmin from "../Trainer/ExercisesAdmin";
import ClientMeasures from "../Trainer/ClientMeasures";
import ClientWorkoutHistory from "../../../components/ClientWorkoutHistory";
import BackButton from "../../../components/ui/BackButton";
import { toast } from "react-hot-toast";
import { Dumbbell, Ruler, CalendarDays, Trash2 } from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientView, setClientView] = useState("exercises"); // "exercises" | "measures" | "history"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(true);
  // Map clientId -> training_days
  const [trainingDaysMap, setTrainingDaysMap] = useState({});
  // Map clientId -> completed sessions count this week
  const [weeklyProgressMap, setWeeklyProgressMap] = useState({});

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerId = userProfile?.id;

  const fetchClients = async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id_cliente, profiles(name, email), trainer_id, training_days")
        .order("created_at", { ascending: true });
      if (error) throw error;

      setTimeout(async () => {
        setClients(data || []);
        // Construir mapa de días
        const map = {};
        (data || []).forEach((c) => {
          map[c.id_cliente] = c.training_days ?? 5;
        });
        setTrainingDaysMap(map);

        // Traer sesiones completadas esta semana
        const now = new Date();
        const dayOfWeek = (now.getDay() + 6) % 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek);
        monday.setHours(0, 0, 0, 0);
        const mondayStr = monday.toISOString().split("T")[0];

        const { data: sessData } = await supabase
          .from("workout_sessions")
          .select("client_id, numero_dia")
          .gte("fecha", mondayStr)
          .eq("completed", true);

        if (sessData) {
          const progMap = {};
          sessData.forEach((s) => {
            if (!progMap[s.client_id]) progMap[s.client_id] = new Set();
            progMap[s.client_id].add(s.numero_dia);
          });
          const countMap = {};
          Object.keys(progMap).forEach((cId) => {
            countMap[cId] = progMap[cId].size;
          });
          setWeeklyProgressMap(countMap);
        }

        setShowSkeleton(false);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const assignClient = async (clientId) => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ trainer_id: trainerId })
        .eq("id_cliente", clientId);
      if (error) throw error;

      // Buscar el nombre del cliente asignado
      const assignedClient = clients.find((c) => c.id_cliente === clientId);
      const clientName = assignedClient?.profiles?.name || "Cliente";

      toast.success(`${clientName} añadido correctamente`);
      fetchClients();
    } catch (err) {
      toast.error("Error al asignar cliente: " + err.message);
    }
  };

  const handleSelectClient = (client, view = "exercises") => {
    setSelectedClient(client);
    setClientView(view);
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setClientView("exercises");
  };

  const updateTrainingDays = async (clientId, days) => {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 7) return;
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ training_days: daysNum })
        .eq("id_cliente", clientId);
      if (error) throw error;
      setTrainingDaysMap((prev) => ({ ...prev, [clientId]: daysNum }));
      toast.success(`Días de entrenamiento actualizados a ${daysNum}`);
    } catch (err) {
      toast.error("Error al actualizar días: " + err.message);
    }
  };

  const confirmDeleteClient = (client) => {
    const name = client.profiles?.name || "este cliente";
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-gray-900 border border-red-500/60 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 text-white pointer-events-auto`}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-bold text-sm text-red-400">
              ¿Eliminar cuenta de {name}?
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Esta acción desasignará y eliminará el registro de {name}. ¿Deseas continuar?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await deleteClientAccount(client.id_cliente, name);
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-md shadow-red-900/50"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const deleteClientAccount = async (clientId, clientName) => {
    try {
      const { error: clienteErr } = await supabase
        .from("clientes")
        .delete()
        .eq("id_cliente", clientId);
      if (clienteErr) throw clienteErr;

      try {
        await supabase.from("profiles").delete().eq("id", clientId);
      } catch (_) {}

      setClients((prev) => prev.filter((c) => c.id_cliente !== clientId));
      toast.success(`Cuenta de ${clientName} eliminada correctamente`);
    } catch (err) {
      toast.error("Error al eliminar cliente: " + err.message);
    }
  };

  const assignedClients = clients.filter((c) => c.trainer_id === trainerId);
  const unassignedClients = clients.filter((c) => c.trainer_id !== trainerId);

  const SkeletonCard = () => (
    <div className="animate-pulse border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 h-28" />
  );

  const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* HEADER SIEMPRE VISIBLE */}
        <div className="flex items-center justify-between">
          <BackButton
            label="Atrás"
            className="text-gray-300 hover:text-blue-400"
          />
          <div className="w-20"></div>
        </div>

        {error && <p className="text-center text-red-400">{error}</p>}

        <AnimatePresence mode="wait">
          {!selectedClient ? (
            <motion.div
              key="client-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-10"
            >
              {/* CLIENTES ASIGNADOS */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Clientes Asignados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {showSkeleton ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => <SkeletonCard key={i} />)
                  ) : assignedClients.length === 0 ? (
                    <p className="text-center text-gray-400">
                      No tienes clientes asignados
                    </p>
                  ) : (
                    assignedClients.map((client, i) => (
                      <motion.div
                        key={client.id_cliente}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={listItemVariants}
                        className="relative border border-green-500 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-6 flex flex-col justify-between"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent opacity-50 rounded-2xl"></div>
                        <div className="flex justify-between items-start">
                          <div
                            className="relative z-10 cursor-pointer flex-1"
                            onClick={() => handleSelectClient(client, "exercises")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleSelectClient(client, "exercises");
                            }}
                            aria-label={`View details for ${client.profiles.name}`}
                          >
                            <p className="font-semibold text-lg text-gray-100">
                              {client.profiles.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {client.profiles.email}
                            </p>
                            <span className="text-green-400 font-medium mt-1.5 block text-xs">
                              Asignado
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteClient(client);
                            }}
                            className="relative z-10 p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition cursor-pointer active:scale-95 ml-2"
                            title={`Eliminar cuenta de ${client.profiles.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Días de entrenamiento */}
                        <div className="relative z-10 flex items-center justify-between mt-3 bg-gray-900/60 p-2.5 rounded-xl border border-gray-700/60">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-300 flex-shrink-0" />
                            <span className="text-xs text-gray-300 font-semibold">Días:</span>
                            <select
                              value={trainingDaysMap[client.id_cliente] ?? 5}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateTrainingDays(client.id_cliente, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                              aria-label={`Training days for ${client.profiles.name}`}
                            >
                              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                <option key={d} value={d}>{d} {d === 1 ? "día" : "días"}</option>
                              ))}
                            </select>
                          </div>

                          {/* Resumen semanal de completados */}
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block font-semibold">Esta semana</span>
                            <span className="text-xs font-bold text-green-400">
                              {weeklyProgressMap[client.id_cliente] || 0} / {trainingDaysMap[client.id_cliente] || 5} días ✓
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="relative z-10 flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClient(client, "exercises");
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                            title="Ver ejercicios"
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                            Ejercicios
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClient(client, "measures");
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                            title="Ver medidas corporales"
                          >
                            <Ruler className="w-3.5 h-3.5" />
                            Medidas
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClient(client, "history");
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                            title="Ver calendario y respuestas de sesiones"
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            Calendario
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* CLIENTES DISPONIBLES */}
              {unassignedClients.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-center">
                    Clientes Disponibles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {showSkeleton
                      ? Array(3)
                          .fill(0)
                          .map((_, i) => <SkeletonCard key={i} />)
                      : unassignedClients.map((client, i) => (
                          <motion.div
                            key={client.id_cliente}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={listItemVariants}
                            className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-6 flex justify-between items-center"
                          >
                             <div>
                              <p className="font-semibold text-lg text-gray-100">
                                {client.profiles.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {client.profiles.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => assignClient(client.id_cliente)}
                                className="relative z-10 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 text-xs font-semibold cursor-pointer"
                              >
                                Asignar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteClient(client);
                                }}
                                className="relative z-10 p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-900/60 transition cursor-pointer active:scale-95"
                                title={`Eliminar cuenta de ${client.profiles.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="client-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tabs para cambiar entre Ejercicios, Medidas y Calendario */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50 flex-wrap justify-center gap-1">
                  <button
                    onClick={() => setClientView("exercises")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-sm ${
                      clientView === "exercises"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" />
                    Ejercicios
                  </button>
                  <button
                    onClick={() => setClientView("measures")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-sm ${
                      clientView === "measures"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                    Medidas
                  </button>
                  <button
                    onClick={() => setClientView("history")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-sm ${
                      clientView === "history"
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Calendario / Sesiones
                  </button>
                </div>
              </div>

              {/* Vista según tab seleccionado */}
              <AnimatePresence mode="wait">
                {clientView === "exercises" ? (
                  <ClientExercisesAdmin
                    key="exercises-view"
                    clientId={selectedClient.id_cliente}
                    onBack={handleBackToClients}
                  />
                ) : clientView === "measures" ? (
                  <ClientMeasures
                    key="measures-view"
                    clientId={selectedClient.id_cliente}
                    onBack={handleBackToClients}
                  />
                ) : (
                  <ClientWorkoutHistory
                    key="history-view"
                    clientId={selectedClient.id_cliente}
                    onBack={handleBackToClients}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
