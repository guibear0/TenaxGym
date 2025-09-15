//eslint-disable-next-line
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AnimatePresence } from "framer-motion";
import ClientExercisesAdmin from "../Trainer/ExercisesAdmin";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerId = userProfile?.id;

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("id_cliente, profiles(name, email)")
          .eq("trainer_id", trainerId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [trainerId]);

  if (loading) return <p className="text-center mt-6 text-gray-500">Cargando clientes...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel del Entrenador</h1>

      {!selectedClient && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Clientes asignados</h2>
          {clients.length === 0 ? (
            <p className="text-gray-500">No tienes clientes asignados.</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence>
                {clients.map((client) => (
                  <motion.li
                    key={client.id_cliente}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center border p-3 rounded shadow cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.profiles.name}</p>
                      <p className="text-sm text-gray-500">{client.profiles.email}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </>
      )}

      {selectedClient && (
        <div className="mt-8">
          <button
            className="mb-4 text-blue-600 hover:underline"
            onClick={() => setSelectedClient(null)}
          >
            ← Volver a clientes
          </button>
          <ClientExercisesAdmin clientId={selectedClient.id_cliente} />
        </div>
      )}
    </div>
  );
}
