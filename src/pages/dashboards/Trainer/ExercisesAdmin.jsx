/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Clock, Repeat, RotateCcw, StickyNote, Trash2, Edit2 } from "lucide-react";

import ExerciseCatalog from "../../../components/Catalog";

export default function ClientExercisesAdmin({ clientId: propClientId }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(propClientId || "");
  const [day, setDay] = useState(1);
  const [catalog, setCatalog] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(null);
  const [formValues, setFormValues] = useState({
    n_reps: "",
    duracion: "",
    descanso: "",
    descripcion: "",
  });
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [greeting, setGreeting] = useState("");

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const trainerName = userProfile?.name || "";

  // === clientes ===
  useEffect(() => {
    if (propClientId) return;
    const fetchClients = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem("userProfile"));
        const trainerId = userProfile?.id;
        const { data, error } = await supabase
          .from("clientes")
          .select("id_cliente, profiles(name)")
          .eq("trainer_id", trainerId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchClients();
  }, [propClientId]);

  // === catálogo ===
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const { data, error } = await supabase
          .from("catalogo_ejercicios")
          .select("id, nombre, tipo");
        if (error) throw error;

        // Define the desired order for tipo
        const tipoOrder = {
          calentamiento: 1,
          fuerza: 2,
          estabilidad: 3,
          cardio: 4,
        };

        // Sort the catalog based on tipoOrder
        const sortedCatalog = data.sort((a, b) => {
          const orderA = tipoOrder[a.tipo.toLowerCase()] || 999;
          const orderB = tipoOrder[b.tipo.toLowerCase()] || 999;
          return orderA - orderB;
        });

        setCatalog(sortedCatalog || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  // === ejercicios cliente ===
  useEffect(() => {
    if (!clientId) return;
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ejercicios_cliente")
          .select("*, catalogo_ejercicios(nombre, tipo)")
          .eq("client_id", clientId)
          .eq("numero_dia", day)
          .order("created_at", { ascending: true });
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

  // === Dynamic greeting ===
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // === Cuando cambia el cliente, guardamos su nombre ===
  useEffect(() => {
    if (!clientId || clients.length === 0) return;
    const selected = clients.find((c) => c.id_cliente === clientId);
    setClientName(selected ? selected.profiles.name : "");
  }, [clientId, clients]);

  // === Fetch single client ===
  useEffect(() => {
    if (!propClientId) return;
    const fetchSingleClient = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id_cliente, profiles(name)")
        .eq("id_cliente", propClientId)
        .single();
      if (!error && data) {
        setClients([data]);
        setClientName(data.profiles.name);
      }
    };
    fetchSingleClient();
  }, [propClientId]);

  const refreshExercises = async () => {
    const { data } = await supabase
      .from("ejercicios_cliente")
      .select("*, catalogo_ejercicios(nombre, tipo)")
      .eq("client_id", clientId)
      .eq("numero_dia", day)
      .order("created_at", { ascending: true });
    setExercises(data || []);
  };

  const handleAddClick = (id) => {
    setShowAddForm(id);
    setFormValues({ n_reps: "", duracion: "", descanso: "", descripcion: "" });
  };

  const addExercise = async (catalogId) => {
    try {
      const { error } = await supabase.from("ejercicios_cliente").insert([
        {
          client_id: clientId,
          catalogo_id: catalogId,
          numero_dia: day,
          n_reps: formValues.n_reps,
          duracion: formValues.duracion,
          descanso: formValues.descanso,
          descripcion: formValues.descripcion,
        },
      ]);
      if (error) throw error;
      setShowAddForm(null);
      await refreshExercises();
      toast.success("Ejercicio añadido correctamente", {
        style: {
          background: "#1a3c34",
          color: "#d1fae5",
          border: "1px solid #6ee7b7",
        },
      });
    } catch (err) {
      toast.error("Error al añadir: " + err.message, {
        style: {
          background: "#4c1d1b",
          color: "#fee2e2",
          border: "1px solid #f87171",
        },
      });
    }
  };

  const deleteExercise = async (exerciseId) => {
    toast((t) => (
      <span className="flex items-center gap-2">
        ¿Eliminar este ejercicio?
        <button
          onClick={async () => {
            const { error } = await supabase
              .from("ejercicios_cliente")
              .delete()
              .eq("id", exerciseId);
            if (!error) {
              setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
              toast.success("Ejercicio eliminado", {
                style: {
                  background: "#1a3c34",
                  color: "#d1fae5",
                  border: "1px solid #6ee7b7",
                },
              });
            } else {
              toast.error("Error al eliminar", {
                style: {
                  background: "#4c1d1b",
                  color: "#fee2e2",
                  border: "1px solid #f87171",
                },
              });
            }
            toast.dismiss(t.id);
          }}
          className="ml-3 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Confirmar
        </button>
      </span>
    ));
  };

  const startEdit = (exercise) => {
    setEditing(exercise.id);
    setEditValues({
      n_reps: exercise.n_reps || "",
      duracion: exercise.duracion || "",
      descanso: exercise.descanso || "",
      descripcion: exercise.descripcion || "",
    });
  };

  const saveEdit = async (exerciseId) => {
    const { error } = await supabase
      .from("ejercicios_cliente")
      .update(editValues)
      .eq("id", exerciseId);
    if (!error) {
      setEditing(null);
      refreshExercises();
      toast.success("Ejercicio actualizado correctamente", {
        style: {
          background: "#1a3c34",
          color: "#d1fae5",
          border: "1px solid #6ee7b7",
        },
      });
    } else {
      toast.error("Error al actualizar", {
        style: {
          background: "#4c1d1b",
          color: "#fee2e2",
          border: "1px solid #f87171",
        },
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto flex gap-8">
        {/* === Guía lateral === */}
  <aside className="w-48 self-start space-y-3 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
  <h3 className="font-semibold text-lg text-gray-100">Guía</h3>
  <div className="flex items-center gap-2 text-sm">
    <Repeat className="w-4 h-4 text-gray-300" /> Repeticiones
  </div>
  <div className="flex items-center gap-2 text-sm">
    <Clock className="w-4 h-4 text-gray-300" /> Duración
  </div>
  <div className="flex items-center gap-2 text-sm">
    <RotateCcw className="w-4 h-4 text-gray-300" /> Descanso
  </div>
  <div className="flex items-center gap-2 text-sm">
    <StickyNote className="w-4 h-4 text-gray-300" /> Notas de entrenador
  </div>
</aside>

        {/* === Panel principal === */}
        <div className="flex-1">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Exercise Management
              {clientName && (
                <span className="text-blue-400"> - {clientName}</span>
              )}
            </h2>
            {!propClientId && (
              <div className="mb-6">
                <label className="block font-medium mb-2 text-gray-100">Select Client</label>
                <select
                  className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Choose a client --</option>
                  {clients.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.profiles.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {clientId && (
              <>
                <div className="flex gap-3 mb-6 justify-center">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                        d === day
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer"
                      }`}
                    >
                      Día {d}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <p className="text-center text-gray-400">Loading...</p>
                ) : exercises.length === 0 ? (
                  <p className="text-center text-gray-400">No exercises available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exercises.map((ex) => (
                      <motion.div
                        key={ex.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-50"></div>
                        {editing === ex.id ? (
                          <div className="space-y-4 relative z-10">
                            <input
                              placeholder="Reps"
                              className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editValues.n_reps}
                              onChange={(e) =>
                                setEditValues({ ...editValues, n_reps: e.target.value })
                              }
                            />
                            <input
                              placeholder="Duration"
                              className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editValues.duracion}
                              onChange={(e) =>
                                setEditValues({ ...editValues, duracion: e.target.value })
                              }
                            />
                            <input
                              placeholder="Rest"
                              className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editValues.descanso}
                              onChange={(e) =>
                                setEditValues({ ...editValues, descanso: e.target.value })
                              }
                            />
                            <input
                              placeholder="Description"
                              className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editValues.descripcion}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  descripcion: e.target.value,
                                })
                              }
                            />
                            <button
                              onClick={() => saveEdit(ex.id)}
                              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                              aria-label="Save exercise changes"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-lg text-gray-100 relative z-10">
                              {ex.catalogo_ejercicios?.nombre}
                            </p>
                            <div className="mt-3 space-y-2 text-sm relative z-10">
                              {ex.n_reps && (
                                <div className="flex items-center gap-3">
                                  <Repeat className="w-4 h-4 text-gray-300" />
                                  <span>{ex.n_reps}</span>
                                </div>
                              )}
                              {ex.duracion && (
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-gray-300" />
                                  <span>{ex.duracion}</span>
                                </div>
                              )}
                              {ex.descanso && (
                                <div className="flex items-center gap-3">
                                  <RotateCcw className="w-4 h-4 text-gray-300" />
                                  <span>{ex.descanso}</span>
                                </div>
                              )}
                              {ex.descripcion && (
                                <div className="flex items-center gap-3">
                                  <StickyNote className="w-4 h-4 text-gray-300" />
                                  <span>{ex.descripcion}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 z-10">
                              <button
                                onClick={() => startEdit(ex)}
                                className="text-blue-400 hover:text-blue-300"
                                aria-label={`Edit exercise ${ex.catalogo_ejercicios?.nombre}`}
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteExercise(ex.id)}
                                className="text-red-400 hover:text-red-300"
                                aria-label={`Delete exercise ${ex.catalogo_ejercicios?.nombre}`}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Catálogo */}
                <ExerciseCatalog
                  catalog={catalog}
                  showAddForm={showAddForm}
                  handleAddClick={handleAddClick}
                  formValues={formValues}
                  setFormValues={setFormValues}
                  addExercise={addExercise}
                />
              </>
            )}
          </motion.div>
        </div>
       
      </div>
    </div>
  );
}