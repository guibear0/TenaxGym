//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ClientExercisesAdmin from "../Trainer/ExercisesAdmin";
import BackButton from "../../../components/ui/BackButton";
import { toast } from "react-hot-toast";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(true);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerId = userProfile?.id;

  const fetchClients = async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id_cliente, profiles(name, email), trainer_id")
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Simulamos retraso de 3s para los skeletons
      setTimeout(() => {
        setClients(data || []);
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
                        className="relative border border-green-500 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl cursor-pointer p-6 flex flex-col justify-between"
                        onClick={() => setSelectedClient(client)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setSelectedClient(client);
                        }}
                        aria-label={`View details for ${client.profiles.name}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-transparent opacity-50 rounded-2xl"></div>
                        <div className="relative z-10">
                          <p className="font-semibold text-lg text-gray-100">
                            {client.profiles.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {client.profiles.email}
                          </p>
                        </div>
                        <span className="relative z-10 text-green-400 font-medium mt-3">
                          Asignado
                        </span>
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
                            <button
                              onClick={() => assignClient(client.id_cliente)}
                              className="relative z-10 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200"
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
            <ClientExercisesAdmin
              clientId={selectedClient.id_cliente}
              onBack={() => setSelectedClient(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
