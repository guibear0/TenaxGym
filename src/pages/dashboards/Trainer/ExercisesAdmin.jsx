/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Clock,
  Repeat,
  RotateCcw,
  StickyNote,
  Trash2,
  Edit2,
  MessageSquare,
  Trash,
} from "lucide-react";

import { toast } from "react-hot-toast";

import ExerciseCatalog from "../../../components/Catalog";

export default function ExercisesAdmin({ clientId: propClientId, onBack }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(propClientId || "");
  const [day, setDay] = useState(1);
  const [catalog, setCatalog] = useState([]);
  const [exercises, setExercises] = useState({});
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
  const [comments, setComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));

  // === Funciones comentarios ===
  const startEditComment = (tipo) => {
    setEditingComment(tipo);
    setEditCommentValue(comments[tipo]?.comentario || "");
  };

  const saveComment = async (tipo) => {
    try {
      const { error } = await supabase.from("comentarios_bloque").upsert(
        [
          {
            client_id: clientId,
            numero_dia: day,
            tipo: tipo,
            comentario: editCommentValue,
          },
        ],
        {
          onConflict: ["client_id", "numero_dia", "tipo"],
        }
      );

      if (error) throw error;

      setComments((prev) => ({
        ...prev,
        [tipo]: { comentario: editCommentValue },
      }));
      setEditingComment(null);
      toast.success("Comentario guardado correctamente");
    } catch (err) {
      toast.error("Error al guardar comentario: " + err.message);
    }
  };

  // === Traer clientes ===
  useEffect(() => {
    if (propClientId) return;
    const fetchClients = async () => {
      try {
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

  // === Traer catálogo ===
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const { data, error } = await supabase
          .from("catalogo_ejercicios")
          .select("id, nombre, tipo, imagen");
        if (error) throw error;

        const tipoOrder = {
          calentamiento: 1,
          fuerza: 2,
          estabilidad: 3,
          cardio: 4,
        };

        const sortedCatalog = data.sort((a, b) => {
          const orderA = tipoOrder[a.tipo?.toLowerCase()] || 999;
          const orderB = tipoOrder[b.tipo?.toLowerCase()] || 999;
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

  // === Traer ejercicios por cliente y día ===
  useEffect(() => {
    if (!clientId) return;
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ejercicios_cliente")
          .select("*, catalogo_ejercicios(nombre, tipo, imagen)")
          .eq("client_id", clientId)
          .eq("numero_dia", day)
          .order("created_at", { ascending: true });
        if (error) throw error;

        const grouped = data.reduce((acc, ex) => {
          const tipo = ex.catalogo_ejercicios?.tipo || "Otros";
          if (!acc[tipo]) acc[tipo] = [];
          acc[tipo].push(ex);
          return acc;
        }, {});
        setExercises(grouped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
    fetchComments();
  }, [clientId, day]);

  const fetchComments = async () => {
    if (!clientId) return;
    try {
      const { data, error } = await supabase
        .from("comentarios_bloque")
        .select("*")
        .eq("client_id", clientId)
        .eq("numero_dia", day);

      if (error) throw error;

      const map = {};
      data.forEach((c) => {
        map[c.tipo] = { comentario: c.comentario };
      });
      setComments(map);
    } catch (err) {
      console.log("Error fetching comments:", err.message);
    }
  };

  // === Nombre cliente seleccionado ===
  useEffect(() => {
    if (!clientId) return;

    if (propClientId && clients.length === 0) {
      // Si es propClientId, traer el nombre del cliente específico
      const fetchClientName = async () => {
        try {
          const { data, error } = await supabase
            .from("clientes")
            .select("profiles(name)")
            .eq("id_cliente", clientId)
            .single();
          if (error) throw error;
          setClientName(data?.profiles?.name || "");
        } catch (err) {
          console.log("Error fetching client name:", err.message);
        }
      };
      fetchClientName();
    } else if (clients.length > 0) {
      const selected = clients.find((c) => c.id_cliente === clientId);
      setClientName(selected ? selected.profiles.name : "");
    }
  }, [clientId, clients, propClientId]);

  // === Refrescar ejercicios ===
  const refreshExercises = async () => {
    const { data } = await supabase
      .from("ejercicios_cliente")
      .select("*, catalogo_ejercicios(nombre, tipo, imagen)")
      .eq("client_id", clientId)
      .eq("numero_dia", day)
      .order("created_at", { ascending: true });

    const grouped = (data || []).reduce((acc, ex) => {
      const tipo = ex.catalogo_ejercicios?.tipo || "Otros";
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(ex);
      return acc;
    }, {});
    setExercises(grouped);
  };

  // === Funciones ejercicios ===
  const handleAddClick = (id) => {
    setShowAddForm(id);
    setFormValues({ n_reps: "", duracion: "", descanso: "", descripcion: "" });
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addExercise = async (catalogId) => {
    try {
      // Buscar el nombre del ejercicio en el catálogo
      const exercise = catalog.find((ex) => ex.id === catalogId);
      const exerciseName = exercise?.nombre || "Ejercicio";

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
      setShowCatalog(false);
      await refreshExercises();
      toast.success(`${exerciseName} añadido correctamente`);
    } catch (err) {
      toast.error("Error al añadir ejercicio: " + err.message);
    }
  };

  const deleteExercise = (exerciseId, exerciseName) => {
    setDeleteConfirm({ id: exerciseId, name: exerciseName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const exerciseName = deleteConfirm.name;

    const { error } = await supabase
      .from("ejercicios_cliente")
      .delete()
      .eq("id", deleteConfirm.id);

    if (!error) {
      setExercises((prev) => {
        const copy = { ...prev };
        for (const tipo in copy) {
          copy[tipo] = copy[tipo].filter((e) => e.id !== deleteConfirm.id);
          if (copy[tipo].length === 0) delete copy[tipo];
        }
        return copy;
      });
      toast.success(`${exerciseName} eliminado correctamente`);
    } else {
      toast.error("Error al eliminar ejercicio");
    }

    setDeleteConfirm(null);
  };

  const deleteAllExercisesOfDay = async () => {
    try {
      const { error } = await supabase
        .from("ejercicios_cliente")
        .delete()
        .eq("client_id", clientId)
        .eq("numero_dia", day);

      if (error) throw error;

      setExercises({});
      toast.success("Todos los ejercicios del día han sido eliminados");
      setDeleteAllConfirm(false);
    } catch (err) {
      toast.error("Error al eliminar ejercicios: " + err.message);
    }
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
      toast.success("Ejercicio actualizado correctamente");
    } else {
      toast.error("Error al actualizar");
    }
  };

  // === Funciones sesiones ===
  const fetchTrainerSessions = async () => {
    setShowSessions(true);
    setShowCatalog(false);
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from("sesiones")
        .select("*")
        .eq("trainer_id", userProfile.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      toast.error("Error cargando sesiones: " + err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  const addSessionToClient = async (session) => {
    try {
      const { data: sesionExercises, error } = await supabase
        .from("sesion_ejercicios")
        .select("*")
        .eq("sesion_id", session.id)
        .order("orden", { ascending: true });
      if (error) throw error;

      for (const ex of sesionExercises) {
        await supabase.from("ejercicios_cliente").insert([
          {
            client_id: clientId,
            catalogo_id: ex.catalogo_id,
            numero_dia: day,
            n_reps: ex.n_reps,
            duracion: ex.duracion,
            descanso: ex.descanso,
            descripcion: ex.descripcion,
          },
        ]);
      }

      await refreshExercises();
      toast.success(`Sesión "${session.nombre}" añadida correctamente`);
      setShowSessions(false);
    } catch (err) {
      toast.error("Error al añadir sesión: " + err.message);
    }
  };

  // === RETURN ===
  return (
    <div className="min-h-screen p-4">
      {/* Modal de confirmación eliminar un ejercicio */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700  "
          >
            <h3 className="text-xl font-bold mb-4 cursor-pointer">
              Confirmar eliminación
            </h3>
            <p className="text-gray-300 mb-6 cursor-pointer ">
              ¿Estás seguro de eliminar "{deleteConfirm.name}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación borrar todo del día */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700  "
          >
            <h3 className="text-xl font-bold mb-4 cursor-pointer">
              Eliminar todos los ejercicios
            </h3>
            <p className="text-gray-300 mb-6 cursor-pointer ">
              ¿Estás seguro de que quieres eliminar TODOS los ejercicios del Día{" "}
              {day}? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteAllConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={deleteAllExercisesOfDay}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium cursor-pointer"
              >
                Eliminar todos
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-48 w-full self-start space-y-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
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
            <StickyNote className="w-4 h-4 text-gray-300" /> Notas
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 md:p-8 flex flex-col gap-6"
          >
            {/* Botón volver y título cuando es propClientId */}
            {propClientId && onBack && (
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={onBack}
                  className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Volver a clientes
                </button>
              </div>
            )}

            {propClientId && clientName && (
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-100">
                Gestión ejercicios{" "}
                <span className="text-blue-400">{clientName}</span>
              </h2>
            )}

            {!propClientId && (
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-100">
                Gestión de ejercicios
              </h2>
            )}

            {!propClientId && (
              <div>
                <label className="block font-medium mb-2 text-gray-100">
                  Selecciona cliente
                </label>
                <select
                  className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
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
                {/* Días */}
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        d === day
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer"
                      }`}
                    >
                      Día {d}
                    </button>
                  ))}
                </div>

                {/* Botón borrar todo del día */}
                {Object.keys(exercises).length > 0 && (
                  <button
                    onClick={() => setDeleteAllConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition mx-auto"
                  >
                    <Trash size={18} />
                    Borrar todos los ejercicios del día
                  </button>
                )}

                {/* Ejercicios por tipo */}
                {loading ? (
                  <p className="text-center text-gray-400">Cargando...</p>
                ) : Object.keys(exercises).length === 0 ? (
                  <p className="text-center text-gray-400">
                    No hay ejercicios para este día
                  </p>
                ) : (
                  Object.entries(exercises).map(([tipo, exGroup]) => (
                    <div key={tipo} className="mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-blue-400 mb-3 capitalize">
                        {tipo}
                      </h3>

                      {/* Comentario bloque */}
                      <div className="mb-4 bg-gray-900/70 p-3 rounded-xl border border-gray-700/50">
                        {editingComment === tipo ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                              rows={3}
                              value={editCommentValue}
                              onChange={(e) =>
                                setEditCommentValue(e.target.value)
                              }
                              placeholder="Escribe un comentario para este bloque..."
                            />
                            <button
                              onClick={() => saveComment(tipo)}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                            >
                              Guardar comentario
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <p className="text-gray-300 italic">
                              {comments[tipo]?.comentario ||
                                "El entrenador no tiene comentarios para este bloque"}
                            </p>
                            <button
                              onClick={() => startEditComment(tipo)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <MessageSquare className="w-5 h-5 cursor-pointer" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de ejercicios */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {exGroup.map((ex) => (
                          <motion.div
                            key={ex.id}
                            whileHover={{ scale: 1.02 }}
                            className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col gap-2"
                          >
                            {ex.catalogo_ejercicios?.imagen && (
                              <img
                                src={ex.catalogo_ejercicios.imagen}
                                alt={ex.catalogo_ejercicios.nombre}
                                className="w-full h-32 md:h-40 object-cover rounded-lg mb-2"
                              />
                            )}

                            {editing === ex.id ? (
                              <div className="space-y-2">
                                <input
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                  placeholder="Repeticiones"
                                  value={editValues.n_reps}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      n_reps: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                  placeholder="Duración"
                                  value={editValues.duracion}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      duracion: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                  placeholder="Descanso"
                                  value={editValues.descanso}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      descanso: e.target.value,
                                    })
                                  }
                                />
                                <textarea
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2"
                                  rows={2}
                                  placeholder="Descripción"
                                  value={editValues.descripcion}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      descripcion: e.target.value,
                                    })
                                  }
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setEditing(null)}
                                    className="px-3 py-1 bg-gray-600 rounded-lg hover:bg-gray-700 text-white"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => saveEdit(ex.id)}
                                    className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 text-white"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold text-gray-100">
                                    {ex.catalogo_ejercicios?.nombre}
                                  </p>
                                  <div className="flex gap-2">
                                    <Edit2
                                      className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer"
                                      onClick={() => startEdit(ex)}
                                    />
                                    <Trash2
                                      className="w-5 h-5 text-red-400 hover:text-red-300 cursor-pointer"
                                      onClick={() =>
                                        deleteExercise(
                                          ex.id,
                                          ex.catalogo_ejercicios?.nombre
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1 text-sm mt-1">
                                  {ex.n_reps && (
                                    <div className="flex items-center gap-2">
                                      <Repeat className="w-4 h-4 text-gray-300" />
                                      <span>{ex.n_reps}</span>
                                    </div>
                                  )}
                                  {ex.duracion && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-gray-300" />
                                      <span>{ex.duracion}</span>
                                    </div>
                                  )}
                                  {ex.descanso && (
                                    <div className="flex items-center gap-2">
                                      <RotateCcw className="w-4 h-4 text-gray-300" />
                                      <span>{ex.descanso}</span>
                                    </div>
                                  )}
                                  {ex.descripcion && (
                                    <div className="flex items-center gap-2">
                                      <StickyNote className="w-4 h-4 text-gray-300" />
                                      <span>{ex.descripcion}</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {/* Botones añadir */}
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {!showCatalog && !showSessions && (
                    <>
                      <button
                        onClick={() => setShowCatalog(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Añadir desde catálogo
                      </button>
                      <button
                        onClick={() => fetchTrainerSessions()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                      >
                        Añadir desde sesiones
                      </button>
                    </>
                  )}
                  {showCatalog && (
                    <button
                      onClick={() => setShowCatalog(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                    >
                      Cancelar catálogo
                    </button>
                  )}
                  {showSessions && (
                    <button
                      onClick={() => setShowSessions(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                    >
                      Cancelar sesiones
                    </button>
                  )}
                </div>

                {/* Catálogo */}
                {showCatalog && (
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-700/50 mt-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-100">
                      Selecciona un ejercicio del catálogo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {catalog.map((cat) => (
                        <motion.div
                          key={cat.id}
                          className="border border-gray-700 rounded-lg p-4 bg-gray-800"
                        >
                          {cat.imagen && (
                            <img
                              src={cat.imagen}
                              alt={cat.nombre}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h4 className="font-semibold text-gray-100 mb-2">
                            {cat.nombre}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            {cat.tipo}
                          </p>

                          {showAddForm === cat.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Repeticiones (ej: 3x10)"
                                value={formValues.n_reps}
                                onChange={(e) =>
                                  handleFormChange("n_reps", e.target.value)
                                }
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Duración (ej: 45 seg)"
                                value={formValues.duracion}
                                onChange={(e) =>
                                  handleFormChange("duracion", e.target.value)
                                }
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Descanso (ej: 60 seg)"
                                value={formValues.descanso}
                                onChange={(e) =>
                                  handleFormChange("descanso", e.target.value)
                                }
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm"
                              />
                              <textarea
                                placeholder="Descripción (opcional)"
                                value={formValues.descripcion}
                                onChange={(e) =>
                                  handleFormChange(
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white p-2 text-sm"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addExercise(cat.id)}
                                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium cursor-pointer"
                                >
                                  Añadir
                                </button>
                                <button
                                  onClick={() => setShowAddForm(null)}
                                  className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddClick(cat.id)}
                              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium cursor-pointer"
                            >
                              Seleccionar
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sesiones */}
                {showSessions && (
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-700/50 mt-4">
                    {loadingSessions ? (
                      <p className="text-gray-400">Cargando sesiones...</p>
                    ) : sessions.length === 0 ? (
                      <p className="text-gray-400">
                        No hay sesiones disponibles
                      </p>
                    ) : (
                      sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="flex justify-between items-center border-b border-gray-700 py-2 cursor-pointer"
                        >
                          <span className="text-gray-200">{sess.nombre}</span>
                          <button
                            onClick={() => addSessionToClient(sess)}
                            className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 text-white transition cursor-pointer"
                          >
                            Añadir
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
