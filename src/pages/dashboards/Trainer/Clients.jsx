//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ClientExercisesAdmin from "../Trainer/ExercisesAdmin";
import BackButton from "../../../components/ui/BackButton";
import { toast, Toaster } from "react-hot-toast";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerId = userProfile?.id;

  // Traer todos los clientes
  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id_cliente, profiles(name, email), trainer_id")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
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
      toast.success("Cliente asignado correctamente", {
        style: {
          background: "#1a3c34",
          color: "#d1fae5",
          border: "1px solid #6ee7b7",
        },
      });
      fetchClients();
    } catch (err) {
      toast.error("Error al asignar cliente: " + err.message, {
        style: {
          background: "#4c1d1b",
          color: "#fee2e2",
          border: "1px solid #f87171",
        },
      });
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-300">Cargando clientes...</p>;
  if (error)
    return <p className="text-center mt-20 text-red-400">{error}</p>;

  // Separar asignados y no asignados
  const assignedClients = clients.filter((c) => c.trainer_id === trainerId);
  const unassignedClients = clients.filter((c) => c.trainer_id !== trainerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton label="Atrás" className="text-gray-300 hover:text-blue-400" />
          <div className="w-20"></div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedClient ? (
            <motion.div
              key="client-list"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {/* Clientes asignados */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">Clientes Asignados</h2>
                {assignedClients.length === 0 ? (
                  <p className="text-center text-gray-400">No tiens clientes asignados</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignedClients.map((client) => (
                      <motion.div
                        key={client.id_cliente}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl hover:border-green-500 cursor-pointer p-6 flex flex-col justify-between"
                        onClick={() => setSelectedClient(client)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedClient(client);
                          }
                        }}
                        aria-label={`View details for ${client.profiles.name}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent opacity-50"></div>
                        <div className="relative z-10">
                          <p className="font-semibold text-lg text-gray-100">{client.profiles.name}</p>
                          <p className="text-sm text-gray-400">{client.profiles.email}</p>
                        </div>
                        <span className="relative z-10 text-green-400 font-medium mt-3">Asignado</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clientes no asignados */}
              {unassignedClients.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-center">Clientes Disponibles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unassignedClients.map((client) => (
                      <motion.div
                        key={client.id_cliente}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-500 p-6 flex justify-between items-center"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            assignClient(client.id_cliente);
                          }
                        }}
                        aria-label={`Assign client ${client.profiles.name}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-50"></div>
                        <div className="relative z-10">
                          <p className="font-semibold text-lg text-gray-100">{client.profiles.name}</p>
                          <p className="text-sm text-gray-400">{client.profiles.email}</p>
                        </div>
                        <button
                          className="relative z-10 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            assignClient(client.id_cliente);
                          }}
                          aria-label={`Assign ${client.profiles.name}`}
                        >
                          Asignar
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="client-detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Botón para volver a la lista de clientes */}
              <div>
                <button
                  className="text-blue-400 hover:text-blue-300 font-medium mb-2 flex items-center gap-2 cursor-pointer"
                  onClick={() => setSelectedClient(null)}
                  aria-label="Volver a lista de clientes"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Volver a Clientes
                </button>
              </div>


              {/* Vista de ejercicios del cliente */}
              <ClientExercisesAdmin clientId={selectedClient.id_cliente} />
            </motion.div>
          )}
        </AnimatePresence>

        <Toaster position="top-center" />
      </div>
    </div>
  );
}