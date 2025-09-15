/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AnimatePresence } from "framer-motion";
import { Info, Clock, Repeat, RotateCcw, Zap, PlayCircle, HeartPulse, Scale, BicepsFlexed, StickyNote } from "lucide-react";

export default function ClientExercises({ day }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const clientId = userProfile?.id;

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("ejercicios_cliente")
          .select(`*, catalogo_ejercicios(nombre, tipo, imagen)`)
          .eq("client_id", clientId)
          .eq("numero_dia", day)
          .order("catalogo_id", { ascending: true });

        if (error) throw error;
        setExercises(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [clientId, day]);

  if (loading) return <p className="text-center mt-6 text-gray-500">Cargando ejercicios...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (exercises.length === 0) return <p className="text-center mt-6 text-gray-500">No hay ejercicios para este día.</p>;

  const typeMapping = {
    "CALENTAMIENTO": "Calentamiento",
    "BLOQUE_FUERZA": "Fuerza",
    "ESTABILIDAD_CARDIO": "Estabilidad",
    "CARDIO": "Cardio",
  };

  const groupedByType = exercises.reduce((acc, ex) => {
    const rawType = ex.catalogo_ejercicios?.tipo || "Otros";
    const type = typeMapping[rawType] || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(ex);
    return acc;
  }, {});

  // Fondo blanco para todos los tipos
  const typeColors = {
    "Calentamiento": "bg-white border-yellow-500",
    "Fuerza": "bg-white border-orange-500",
    "Estabilidad": "bg-white border-fuchsia-800",
    "Cardio": "bg-white border-red-500",
  };

  const typeIcons = {
    "Calentamiento": Zap,
    "Fuerza": BicepsFlexed,
    "Estabilidad": Scale,
    "Cardio": HeartPulse,
  };

  const order = ["Calentamiento", "Fuerza", "Estabilidad", "Cardio", "Otros"];

  // Guía de iconos con colores
  const iconGuide = [
    { icon: Repeat, label: "Repeticiones", color: "text-yellow-500" },
    { icon: Clock, label: "Duración", color: "text-green-500" },
    { icon: RotateCcw, label: "Descanso", color: "text-purple-500" },
    { icon: StickyNote, label: "Descripción", color: "text-gray-500" },
    { icon: Info, label: "Ver imagen", color: "text-blue-600" },
   
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Guía de iconos */}
      <div className="flex flex-wrap gap-6 mb-6">
        {iconGuide.map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-2 text-gray-700">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {order.map((type) => {
        if (!groupedByType[type]) return null;
        const exList = groupedByType[type];
        const IconComponent = typeIcons[type] || PlayCircle;
        const colorClass = typeColors[type] || "bg-white";

        return (
          <div key={type}>
            <h3 className={`text-lg font-semibold mb-3 pl-3 py-1 rounded-r-lg flex items-center gap-2 ${colorClass} border-l-4`}>
              <IconComponent className="w-5 h-5 text-gray-700" />
              {type}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {exList.map((ex, idx) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                    whileHover={{ scale: 1.03, y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.15)" }}
                    className={`relative bg-white rounded-lg border p-4 cursor-pointer flex justify-between items-start ${colorClass}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{ex.catalogo_ejercicios?.nombre}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ex.n_reps && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Repeat className="w-4 h-4 text-yellow-500" /> {ex.n_reps} 
                          </div>
                        )}
                        {ex.duracion && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-green-500" /> {ex.duracion}
                          </div>
                        )}
                        {ex.descanso && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <RotateCcw className="w-4 h-4 text-purple-500" /> {ex.descanso}
                          </div>
                        )}
                      </div>
                      {ex.descripcion && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-700">
                          <StickyNote className="w-4 h-4 text-gray-500" /> {ex.descripcion}
                        </div>
                      )}
                    </div>
                    {ex.catalogo_ejercicios?.imagen && (
                      <button
                        onClick={() => setSelectedImage(ex.catalogo_ejercicios.imagen)}
                        className="ml-3 text-blue-600 hover:text-blue-800"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage}
              alt="Ejercicio"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-h-[80%] max-w-[80%] rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
