/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../../lib/supabase";
import {
  Clock,
  Repeat,
  RotateCcw,
  Zap,
  PlayCircle,
  HeartPulse,
  Scale,
  BicepsFlexed,
  StickyNote,
  X,
  ImageUpscale,
} from "lucide-react";

export default function ClientExercises({ day }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState({});

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const clientId = userProfile?.id;

  // === Traer ejercicios y comentarios ===
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
          .order("orden", { ascending: true });

        if (error) throw error;
        setExercises(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!clientId) return;
      try {
        const { data, error } = await supabase
          .from("comentarios_bloque")
          .select("*")
          .eq("client_id", clientId)
          .eq("numero_dia", day);

        if (error) throw error;

        const typeMapping = {
          CALENTAMIENTO: "Calentamiento",
          BLOQUE_FUERZA: "Fuerza",
          ESTABILIDAD_CARDIO: "Estabilidad",
          CARDIO: "Cardio",
        };

        const map = {};
        data.forEach((c) => {
          const uiType = typeMapping[c.tipo] || "Otros";
          // Solo el último comentario por tipo
          map[uiType] = c.comentario;
        });

        setComments(map);
      } catch (err) {
        console.log("Error fetching comments:", err.message);
      }
    };

    fetchExercises();
    fetchComments();
  }, [clientId, day]);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-400">Cargando ejercicios</p>
    );
  if (error) return <p className="text-center mt-20 text-red-400">{error}</p>;
  if (exercises.length === 0)
    return (
      <p className="text-center mt-20 text-gray-400">
        No hay ejercicios para hoy.
      </p>
    );

  const typeMapping = {
    CALENTAMIENTO: "Calentamiento",
    BLOQUE_FUERZA: "Fuerza",
    ESTABILIDAD_CARDIO: "Estabilidad",
    CARDIO: "Cardio",
  };

  const groupedByType = exercises.reduce((acc, ex) => {
    const rawType = ex.catalogo_ejercicios?.tipo || "Otros";
    const type = typeMapping[rawType] || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(ex);
    return acc;
  }, {});

  const typeColors = {
    Calentamiento: "border-yellow-600",
    Fuerza: "border-orange-500",
    Estabilidad: "border-fuchsia-800",
    Cardio: "border-red-600",
    Otros: "border-gray-600",
  };

  const typeIcons = {
    Calentamiento: Zap,
    Fuerza: BicepsFlexed,
    Estabilidad: Scale,
    Cardio: HeartPulse,
    Otros: PlayCircle,
  };

  const order = ["Calentamiento", "Fuerza", "Estabilidad", "Cardio"];

  const iconGuide = [
    { icon: Repeat, label: "Repeticiones", color: "text-yellow-500" },
    { icon: Clock, label: "Duración", color: "text-green-500" },
    { icon: RotateCcw, label: "Descanso", color: "text-purple-500" },
    { icon: StickyNote, label: "Descripción", color: "text-gray-500" },
    { icon: ImageUpscale, label: "Ver Imagen", color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5 md:space-y-8"
        >
          {/* Icon Guide - compact on mobile */}
          <div className="flex flex-wrap gap-3 md:gap-6">
            {iconGuide.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-gray-100"
              >
                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${color}`} />
                <span className="text-xs md:text-sm">{label}</span>
              </div>
            ))}
          </div>

          {order.map((type) => {
            if (!groupedByType[type]) return null;
            const exList = groupedByType[type];
            const IconComponent = typeIcons[type];
            const colorClass = typeColors[type];

            return (
              <div key={type}>
                <h3
                  className={`text-base md:text-lg font-semibold mb-2 pl-3 md:pl-4 py-1.5 md:py-2 rounded-r-lg flex items-center gap-2 bg-gray-800/80 border-l-4 ${colorClass}`}
                >
                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                  {type}
                </h3>

                {/* Comentario del entrenador */}
                <div className="mb-3 md:mb-4 bg-gray-900/70 p-3 md:p-4 rounded-xl border border-gray-700/50">
                  <p className="text-gray-300 italic text-sm md:text-base">
                    {comments[type] || "Sin comentarios del entrenador"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <AnimatePresence>
                    {exList.map((ex, idx) => (
                      <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          delay: idx * 0.05,
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        whileHover={{ scale: 1.03, y: -3 }}
                        className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-700/50 p-3 md:p-5 hover:border-blue-500 transition-all duration-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-50 rounded-xl md:rounded-2xl"></div>
                        <div className="relative z-10 flex gap-3 items-start">
                          {/* Thumbnail de imagen - visible en móvil como imagen inline */}
                          {ex.catalogo_ejercicios?.imagen && (
                            <button
                              onClick={() =>
                                setSelectedImage(ex.catalogo_ejercicios.imagen)
                              }
                              className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-600/50 hover:border-blue-500 transition-colors"
                              aria-label={`Ver imagen de ${ex.catalogo_ejercicios?.nombre}`}
                            >
                              <img
                                src={ex.catalogo_ejercicios.imagen}
                                alt={ex.catalogo_ejercicios.nombre}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover"
                              />
                            </button>
                          )}
                          {/* Info del ejercicio */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-100 text-sm md:text-base truncate">
                              {ex.catalogo_ejercicios?.nombre}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 md:mt-3 text-xs md:text-sm text-gray-300">
                              {ex.n_reps && (
                                <div className="flex items-center gap-1 md:gap-2">
                                  <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                                  <span>{ex.n_reps}</span>
                                </div>
                              )}
                              {ex.duracion && (
                                <div className="flex items-center gap-1 md:gap-2">
                                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                                  <span>{ex.duracion}</span>
                                </div>
                              )}
                              {ex.descanso && (
                                <div className="flex items-center gap-1 md:gap-2">
                                  <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                                  <span>{ex.descanso}</span>
                                </div>
                              )}
                              {ex.descripcion && (
                                <div className="flex items-center gap-1 md:gap-2 w-full mt-0.5">
                                  <StickyNote className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{ex.descripcion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Modal de imagen - renderizado con Portal para evitar problemas con transforms de framer-motion */}
      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
              role="dialog"
              aria-label="Exercise image modal"
              aria-modal="true"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-h-[90%] max-w-[90%] md:max-h-[80%] md:max-w-[80%] rounded-2xl shadow-2xl border border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  onClick={() => setSelectedImage(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 md:top-4 md:right-4 bg-gray-800/80 backdrop-blur-sm rounded-full p-1.5 md:p-2 text-gray-300 hover:text-blue-400 border border-gray-700/50 hover:border-blue-500 transition-all duration-200 z-10"
                  aria-label="Close image modal"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                <img
                  src={selectedImage}
                  alt="Exercise"
                  className="max-h-[85vh] max-w-[85vw] md:max-h-[80vh] md:max-w-[80vw] rounded-2xl"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
