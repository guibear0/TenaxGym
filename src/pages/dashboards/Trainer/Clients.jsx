//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ClientExercisesAdmin from "../Trainer/ExercisesAdmin";
import BackButton from "../../../components/ui/BackButton";
import { toast, Toaster } from "react-hot-toast";

export default function Clients() {
  const [clients, setClients] = useState([]); // todos los clientes
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
      toast.success("Cliente asignado correctamente");
      fetchClients();
    } catch (err) {
      toast.error("Error al asignar cliente: " + err.message);
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-500">Cargando clientes...</p>;
  if (error)
    return <p className="text-center mt-6 text-red-500">{error}</p>;

  // separar asignados y no asignados
  const assignedClients = clients.filter(c => c.trainer_id === trainerId);
  const unassignedClients = clients.filter(c => c.trainer_id !== trainerId);

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {/* BackButton al dashboard */}
      <div className="mb-4">
        <BackButton />
      </div>

      <AnimatePresence mode="wait">
        {!selectedClient ? (
          <motion.div
            key="client-list"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            {/* Clientes asignados */}
            <div>
              <h2 className="text-3xl font-bold mb-4 text-center">Clientes Asignados</h2>
              {assignedClients.length === 0 ? (
                <p className="text-center text-gray-500">No tienes clientes asignados.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedClients.map(client => (
                    <motion.div
                      key={client.id_cliente}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="border p-4 rounded shadow hover:shadow-lg cursor-pointer bg-white flex flex-col justify-between"
                      onClick={() => setSelectedClient(client)}
                    >
                      <div>
                        <p className="font-medium text-lg">{client.profiles.name}</p>
                        <p className="text-sm text-gray-500">{client.profiles.email}</p>
                      </div>
                      <span className="text-green-600 font-medium mt-2">Asignado</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Clientes no asignados */}
            {unassignedClients.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-4 text-center">Clientes Disponibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unassignedClients.map(client => (
                    <motion.div
                      key={client.id_cliente}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="border p-4 rounded shadow hover:shadow-lg flex justify-between items-center bg-white"
                    >
                      <div>
                        <p className="font-medium text-lg">{client.profiles.name}</p>
                        <p className="text-sm text-gray-500">{client.profiles.email}</p>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => assignClient(client.id_cliente)}
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
            className="flex flex-col gap-4"
          >
            {/* Botón para volver a la lista de clientes */}
            <div>
              <button
                className="text-blue-600 hover:underline font-medium mb-2"
                onClick={() => setSelectedClient(null)}
              >
                ← Volver a clientes
              </button>
            </div>

            {/* Título cliente */}
            <h2 className="text-2xl font-bold mb-4">
              Gestión de ejercicios -{" "}
              <span className="text-blue-600">{selectedClient.profiles.name}</span>
            </h2>

            {/* Vista de ejercicios del cliente */}
            <ClientExercisesAdmin clientId={selectedClient.id_cliente} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-center" />
    </div>
  );
}
