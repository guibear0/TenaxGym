import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {  AnimatePresence } from "framer-motion";
//eslint-disable-next-line
import { motion } from "framer-motion";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ID del cliente
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const clientId = userProfile?.id;

  useEffect(() => {
    const fetchTrainer = async () => {
      setLoading(true);
      setError("");

      try {
        // Obtener el registro del cliente para conocer su trainer_id
        const { data: clientData, error: clientError } = await supabase
          .from("clientes")
          .select("trainer_id")
          .eq("id_cliente", clientId)
          .single();

        if (clientError) throw clientError;

        if (!clientData?.trainer_id) {
          setTrainers([]);
          return;
        }

        // Obtener información del entrenador
        const { data: trainerData, error: trainerError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", clientData.trainer_id)
          .single();

        if (trainerError) throw trainerError;

        setTrainers([trainerData]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [clientId]);

  if (loading) return <p className="text-center mt-8">Cargando...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard del Cliente</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Tus entrenadores</h2>

        {trainers.length === 0 ? (
          <p className="text-gray-500">Aún no tienes un entrenador asignado.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {trainers.map((trainer) => (
                <motion.li
                  key={trainer.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center border p-4 rounded shadow"
                >
                  <div>
                    <p className="font-medium">{trainer.name}</p>
                    <p className="text-sm text-gray-500">{trainer.email}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
