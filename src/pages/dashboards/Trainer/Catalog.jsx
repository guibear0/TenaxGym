// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function CatalogManager() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: "",
    tipo: "CALENTAMIENTO",
    descripcion: "",
    imagen: "",
  });
  const [expandedSections, setExpandedSections] = useState({
    CALENTAMIENTO: false,
    BLOQUE_FUERZA: false,
    ESTABILIDAD_CARDIO: false,
    CARDIO: false,
  });

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userName = userProfile?.name || "";

  // Map ENUM values to display names
  const typeDisplayMapping = {
    CALENTAMIENTO: "Calentamiento",
    BLOQUE_FUERZA: "Fuerza",
    ESTABILIDAD_CARDIO: "Estabilidad",
    CARDIO: "Cardio",
  };

  // Fetch exercises from catalogo_ejercicios
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("catalogo_ejercicios")
          .select("id, nombre, tipo, descripcion, imagen")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setCatalog(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Group exercises by type
  const tipoOrder = ["CALENTAMIENTO", "BLOQUE_FUERZA", "ESTABILIDAD_CARDIO", "CARDIO"];
  const groupedCatalog = tipoOrder.map((tipo) => ({
    tipo,
    displayName: typeDisplayMapping[tipo],
    items: catalog.filter((item) => item.tipo === tipo),
  }));

  // Toggle section expand/collapse
  const toggleSection = (tipo) => {
    setExpandedSections((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Add new exercise
  const addExercise = async () => {
    if (!formValues.nombre || !formValues.tipo) {
      toast.error("Name and type are required", {
        style: { background: "#4c1d1b", color: "#fee2e2", border: "1px solid #f87171" },
      });
      return;
    }
    try {
      const { error } = await supabase.from("catalogo_ejercicios").insert([
        {
          nombre: formValues.nombre,
          tipo: formValues.tipo,
          descripcion: formValues.descripcion,
          imagen: formValues.imagen || null,
        },
      ]);
      if (error) throw error;
      setFormValues({ nombre: "", tipo: "CALENTAMIENTO", descripcion: "", imagen: "" });
      setShowAddForm(false);
      const { data } = await supabase
        .from("catalogo_ejercicios")
        .select("id, nombre, tipo, descripcion, imagen")
        .order("created_at", { ascending: true });
      setCatalog(data || []);
      toast.success("Exercise added successfully", {
        style: { background: "#1a3c34", color: "#d1fae5", border: "1px solid #6ee7b7" },
      });
    } catch (err) {
      toast.error("Error adding exercise: " + err.message, {
        style: { background: "#4c1d1b", color: "#fee2e2", border: "1px solid #f87171" },
      });
    }
  };

  // Delete exercise
  const deleteExercise = async (id, nombre) => {
    toast((t) => (
      <span className="flex items-center gap-3  text-gray-100  rounded-lg p-4">
        Delete {nombre}?
        <motion.button
          onClick={async () => {
            try {
              const { error } = await supabase
                .from("catalogo_ejercicios")
                .delete()
                .eq("id", id);
              if (error) throw error;
              setCatalog((prev) => prev.filter((item) => item.id !== id));
              toast.success("Exercise deleted", {
                style: { background: "#1f2937cc", color: "#f3f4f6", border: "1px solid #3b82f6" },
              });
            } catch (err) {
              toast.error("Error deleting: " + err.message, {
                style: { background: "#1f2937cc", color: "#f3f4f6", border: "1px solid #ef4444" },
              });
            }
            toast.dismiss(t.id);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
          aria-label="Confirm deletion"
        >
          Confirm
        </motion.button>
      </span>
    ), {
      style: { background: "#1f2937cc", border: "1px solid #6b7280", color: "#f3f4f6" },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm text-gray-100 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {userName ? `Hello, ${userName}!` : "Hello!"} Manage Your Exercise Catalog!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8"
        >
          {/* Add Exercise Button */}
          <div className="mb-6">
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              aria-label={showAddForm ? "Close add exercise form" : "Open add exercise form"}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">{showAddForm ? "Cerrar" : "Añadir Ejercicio"}</span>
            </motion.button>
          </div>

          {/* Add Exercise Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 p-6 bg-gray-900/80 rounded-2xl border border-gray-700/50"
              >
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Añadir Nuevo Ejercicio</h2>
                <div className="space-y-4">
                  <input
                    name="nombre"
                    placeholder="Exercise Name"
                    value={formValues.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Exercise name"
                  />
                  <select
                    name="tipo"
                    value={formValues.tipo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Exercise type"
                  >
                    {tipoOrder.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {typeDisplayMapping[tipo]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción (esto no lo verán los clientes)"
                    value={formValues.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    aria-label="Exercise description"
                  />
                  <input
                    name="imagen"
                    placeholder="Image URL (optional)"
                    value={formValues.imagen}
                    onChange={handleInputChange}
                    className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Exercise image URL"
                  />
                  <motion.button
                    onClick={addExercise}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                    aria-label="Save new exercise"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercise Catalog */}
          {loading ? (
            <p className="text-center text-gray-400">Loading catalog...</p>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : catalog.length === 0 ? (
            <p className="text-center text-gray-400">No exercises in the catalog.</p>
          ) : (
            <div className="space-y-6">
              {groupedCatalog.map((group) => (
                group.items.length > 0 && (
                  <div key={group.tipo}>
                    <motion.div
                      className="flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
                      onClick={() => toggleSection(group.tipo)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expandedSections[group.tipo]}
                      aria-label={`Toggle ${group.displayName} section`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          toggleSection(group.tipo);
                        }
                      }}
                    >
                      <h3 className="font-semibold text-lg text-gray-100">{group.displayName}</h3>
                      <motion.svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: expandedSections[group.tipo] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </motion.svg>
                    </motion.div>
                    <AnimatePresence>
                      {expandedSections[group.tipo] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {group.items.map((item) => (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 hover:border-blue-500 transition-all duration-200"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-50"></div>
                                <div className="relative z-10">
                                  <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-100">{item.nombre}</p>
                                    <motion.button
                                      onClick={() => deleteExercise(item.id, item.nombre)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="text-red-400 hover:text-red-300"
                                      aria-label={`Delete exercise ${item.nombre}`}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1">{typeDisplayMapping[item.tipo]}</p>
                                  {item.descripcion && (
                                    <p className="text-sm text-gray-300 mt-2">{item.descripcion}</p>
                                  )}
                                  {item.imagen && (
                                    <img
                                      src={item.imagen}
                                      alt={item.nombre}
                                      className="mt-3 w-full h-32 object-cover rounded-lg"
                                    />
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}