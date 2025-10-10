// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/ui/BackButton";
import SesionForm from "../../../components/SesionForm";
import SesionPreview from "../../../components/SesionPreview";
import { toast } from "react-hot-toast";

export default function Sessions() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerId = userProfile?.id;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    fetchSessions();
  }, [trainerId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sesiones")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      toast.error("Error cargando sesiones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (nombre, descripcion) => {
    if (sessions.some((s) => s.nombre === nombre)) {
      toast.error("Ya existe una sesión con ese nombre");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("sesiones")
        .insert([{ nombre, descripcion, trainer_id: trainerId }])
        .select()
        .single();
      if (error) throw error;
      setSessions((prev) => [...prev, data]);
      toast.success("Sesión creada");
      setSelectedSession(data);
      setShowForm(false);
    } catch (err) {
      toast.error("Error creando sesión: " + err.message);
    }
  };

  const updateSessionName = (id, newName) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nombre: newName } : s))
    );
  };

  const duplicateSession = async (session) => {
    let newName = session.nombre + " (copy)";
    let counter = 1;
    while (sessions.some((s) => s.nombre === newName)) {
      counter++;
      newName = session.nombre + ` (copy ${counter})`;
    }

    try {
      const { data: newSession, error: sessionError } = await supabase
        .from("sesiones")
        .insert([
          {
            nombre: newName,
            descripcion: session.descripcion,
            trainer_id: trainerId,
          },
        ])
        .select()
        .single();
      if (sessionError) throw sessionError;

      const { data: exercises, error: exercisesError } = await supabase
        .from("sesion_ejercicios")
        .select("*")
        .eq("sesion_id", session.id);
      if (exercisesError) throw exercisesError;

      for (let ex of exercises) {
        await supabase.from("sesion_ejercicios").insert([
          {
            sesion_id: newSession.id,
            catalogo_id: ex.catalogo_id,
            orden: ex.orden,
            n_reps: ex.n_reps,
            duracion: ex.duracion,
            descanso: ex.descanso,
            descripcion: ex.descripcion,
          },
        ]);
      }

      setSessions((prev) => [...prev, newSession]);
      toast.success("Sesión duplicada");
    } catch (err) {
      toast.error("Error duplicando sesión: " + err.message);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await supabase
        .from("sesion_ejercicios")
        .delete()
        .eq("sesion_id", sessionId);
      const { error } = await supabase
        .from("sesiones")
        .delete()
        .eq("id", sessionId);
      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Sesión eliminada");
      if (selectedSession?.id === sessionId) setSelectedSession(null);
    } catch (err) {
      toast.error("Error eliminando sesión: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <BackButton label="Volver al Dashboard" to="/trainer-dashboard" />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center">
          Sesiones de Ejercicios
        </h1>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedSession(null);
          }}
          className="mb-6 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition"
        >
          {showForm ? "Cerrar formulario" : "Nueva sesión"}
        </button>

        <AnimatePresence>
          {showForm && <SesionForm onSubmit={addSession} key="session-form" />}
        </AnimatePresence>

        <div className="space-y-4 mt-6">
          {loading ? (
            <p className="text-center">Cargando sesiones...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-400">No hay sesiones creadas</p>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                className="bg-gray-800/80 p-4 rounded-2xl flex justify-between items-center"
              >
                <span>{session.nombre}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="px-2 py-1 bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer transition"
                  >
                    Añadir/Editar ejercicios
                  </button>
                  <button
                    onClick={() => duplicateSession(session)}
                    className="px-2 py-1 bg-yellow-600 rounded-lg hover:bg-yellow-700 cursor-pointer transition"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="px-2 py-1 bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer transition"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {selectedSession && (
          <SesionPreview
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            updateSessionName={updateSessionName}
          />
        )}
      </div>
    </div>
  );
}
