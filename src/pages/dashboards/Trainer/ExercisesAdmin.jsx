/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useWorkoutNotifications } from "../../../components/WorkoutNotifications";
import {
  Clock,
  Repeat,
  RotateCcw,
  StickyNote,
  Trash2,
  Edit2,
  MessageSquare,
  Trash,
  GripVertical,
} from "lucide-react";

import { toast } from "react-hot-toast";

import ExerciseCatalog from "../../../components/Catalog";

export default function ExercisesAdmin({ clientId: propClientId, onBack }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(propClientId || "");
  const [day, setDay] = useState(1);
  const [trainingDays, setTrainingDays] = useState(5);
  const [dayNames, setDayNames] = useState({});
  const [editingDayName, setEditingDayName] = useState(false);
  const [dayNameInput, setDayNameInput] = useState("");
  const [weekTemplates, setWeekTemplates] = useState([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
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
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const { push } = useWorkoutNotifications();
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

  // === Traer training_days y nombres de días del cliente ===
  useEffect(() => {
    if (!clientId) return;
    const fetchTrainingDays = async () => {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("training_days")
          .eq("id_cliente", clientId)
          .single();
        if (!error && data?.training_days) {
          setTrainingDays(data.training_days);
          setDay((prev) => (prev > data.training_days ? 1 : prev));
        }

        // Cargar nombres de días
        const { data: namesData } = await supabase
          .from("training_day_config")
          .select("day_number, day_name")
          .eq("client_id", clientId);

        if (namesData) {
          const map = {};
          namesData.forEach((n) => { map[n.day_number] = n.day_name; });
          setDayNames(map);
        }
      } catch (_) {}
    };
    fetchTrainingDays();
  }, [clientId]);

  // Guardar nombre del día actual
  const saveDayName = async () => {
    try {
      const { error } = await supabase
        .from("training_day_config")
        .upsert(
          { client_id: clientId, day_number: day, day_name: dayNameInput.trim() },
          { onConflict: "client_id,day_number" }
        );
      if (error) throw error;
      setDayNames((prev) => ({ ...prev, [day]: dayNameInput.trim() }));
      setEditingDayName(false);
      toast.success("Nombre del día guardado");
    } catch (err) {
      toast.error("Error al guardar nombre: " + err.message);
    }
  };

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
          .order("orden", { ascending: true }); // ✅ Ordenar por campo orden

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
      .order("orden", { ascending: true }); // ✅ Ordenar por campo orden

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

  // === Añadir ejercicio individual desde catálogo ===
  const addExercise = async (catalogId) => {
    try {
      // Buscar el nombre del ejercicio en el catálogo
      const exercise = catalog.find((ex) => ex.id === catalogId);
      const exerciseName = exercise?.nombre || "Ejercicio";

      // Obtener el último orden para este día
      const { data: existingExercises } = await supabase
        .from("ejercicios_cliente")
        .select("orden")
        .eq("client_id", clientId)
        .eq("numero_dia", day)
        .order("orden", { ascending: false })
        .limit(1);

      const nextOrder = existingExercises?.[0]?.orden
        ? existingExercises[0].orden + 1
        : 1;

      const { error } = await supabase.from("ejercicios_cliente").insert([
        {
          client_id: clientId,
          catalogo_id: catalogId,
          numero_dia: day,
          n_reps: formValues.n_reps,
          duracion: formValues.duracion,
          descanso: formValues.descanso,
          descripcion: formValues.descripcion,
          orden: nextOrder, // ✅ Asignar orden
        },
      ]);

      if (error) throw error;
      setShowAddForm(null);
      setShowCatalog(false);
      await refreshExercises();
      toast.success(`${exerciseName} añadido correctamente`);
      push("routine_updated", "¡Tu entrenador ha actualizado tu rutina!", `Se añadió ${exerciseName} al Día ${day}.`);
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
      push("routine_updated", "¡Tu entrenador ha actualizado tu rutina!", `Se eliminaron los ejercicios del Día ${day}.`);
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
      push("routine_updated", "¡Tu entrenador ha actualizado tu rutina!", "Se modificó un ejercicio de tu rutina.");
    } else {
      toast.error("Error al actualizar");
    }
  };

  // === Funciones de drag and drop para reordenar ===
  const handleDragStart = (e, exerciseId) => {
    setDraggedId(exerciseId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(targetId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOverId(null);

    if (draggedId === targetId) return;

    // Obtener todos los ejercicios del día actual ordenados
    const allExercises = Object.values(exercises).flat();
    const draggedIndex = allExercises.findIndex((ex) => ex.id === draggedId);
    const targetIndex = allExercises.findIndex((ex) => ex.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newExercises = [...allExercises];
    const [draggedExercise] = newExercises.splice(draggedIndex, 1);
    newExercises.splice(targetIndex, 0, draggedExercise);

    try {
      // Actualizar el orden en la base de datos
      for (let i = 0; i < newExercises.length; i++) {
        await supabase
          .from("ejercicios_cliente")
          .update({ orden: i + 1 })
          .eq("id", newExercises[i].id);
      }
      toast.success("Orden actualizado");
      await refreshExercises();
    } catch (err) {
      toast.error("Error actualizando orden: " + err.message);
    }

      setDraggedId(null);
  };

  // === Plantillas de Semana ===
  const fetchWeekTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("training_templates")
        .select("*")
        .eq("trainer_id", userProfile?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWeekTemplates(data || []);
      setShowTemplatesModal(true);
    } catch (err) {
      toast.error("Error al cargar plantillas: " + err.message);
    }
  };

  const saveCurrentWeekAsTemplate = async () => {
    if (!templateNameInput.trim()) {
      toast.error("Introduce un nombre para la plantilla");
      return;
    }
    try {
      // 1. Crear plantilla
      const { data: tData, error: tErr } = await supabase
        .from("training_templates")
        .insert([{
          trainer_id: userProfile?.id,
          name: templateNameInput.trim(),
          days: trainingDays,
        }])
        .select()
        .single();
      if (tErr) throw tErr;

      // 2. Traer todos los ejercicios del cliente
      const { data: allEx } = await supabase
        .from("ejercicios_cliente")
        .select("*")
        .eq("client_id", clientId);

      if (allEx && allEx.length > 0) {
        const templateExercises = allEx.map((ex) => ({
          template_id: tData.id,
          day_number: ex.numero_dia,
          exercise_id: ex.catalogo_id,
          orden: ex.orden || 0,
          n_reps: ex.n_reps,
          duracion: ex.duracion,
          descanso: ex.descanso,
          descripcion: ex.descripcion,
        }));

        await supabase.from("training_template_exercises").insert(templateExercises);
      }

      toast.success("Plantilla guardada correctamente");
      setShowSaveTemplateModal(false);
      setTemplateNameInput("");
    } catch (err) {
      toast.error("Error al guardar plantilla: " + err.message);
    }
  };

  const applyTemplateToClient = async (template) => {
    try {
      // 1. Borrar ejercicios actuales del cliente
      await supabase.from("ejercicios_cliente").delete().eq("client_id", clientId);

      // 2. Traer ejercicios de la plantilla
      const { data: tEx, error: tErr } = await supabase
        .from("training_template_exercises")
        .select("*")
        .eq("template_id", template.id);

      if (tErr) throw tErr;

      if (tEx && tEx.length > 0) {
        const newClientExercises = tEx.map((ex) => ({
          client_id: clientId,
          catalogo_id: ex.exercise_id,
          numero_dia: ex.day_number,
          orden: ex.orden || 0,
          n_reps: ex.n_reps,
          duracion: ex.duracion,
          descanso: ex.descanso,
          descripcion: ex.descripcion,
        }));

        await supabase.from("ejercicios_cliente").insert(newClientExercises);
      }

      // 3. Actualizar días de entrenamiento del cliente si aplica
      if (template.days) {
        await supabase.from("clientes").update({ training_days: template.days }).eq("id_cliente", clientId);
        setTrainingDays(template.days);
      }

      toast.success(`Plantilla "${template.name}" aplicada correctamente`);
      setShowTemplatesModal(false);
      await refreshExercises();
    } catch (err) {
      toast.error("Error al aplicar plantilla: " + err.message);
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

  // === Añadir sesión completa al cliente ===
  const addSessionToClient = async (session) => {
    try {
      const { data: sesionExercises, error } = await supabase
        .from("sesion_ejercicios")
        .select("*")
        .eq("sesion_id", session.id)
        .order("orden", { ascending: true });

      if (error) throw error;

      // Obtener el último orden actual del cliente para este día
      const { data: existingExercises } = await supabase
        .from("ejercicios_cliente")
        .select("orden")
        .eq("client_id", clientId)
        .eq("numero_dia", day)
        .order("orden", { ascending: false })
        .limit(1);

      let currentOrder = existingExercises?.[0]?.orden || 0;

      // Insertar todos los ejercicios de la sesión manteniendo su orden relativo
      for (const ex of sesionExercises) {
        currentOrder++;
        await supabase.from("ejercicios_cliente").insert([
          {
            client_id: clientId,
            catalogo_id: ex.catalogo_id,
            numero_dia: day,
            n_reps: ex.n_reps,
            duracion: ex.duracion,
            descanso: ex.descanso,
            descripcion: ex.descripcion,
            orden: currentOrder, // ✅ Mantener orden de la sesión
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
        {/* Sidebar - horizontal on mobile, vertical on desktop */}
        <aside className="md:w-48 w-full self-start bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-gray-700/50">
          <h3 className="font-semibold text-base md:text-lg text-gray-100 mb-2 md:mb-4">Guía</h3>
          <div className="flex flex-wrap md:flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" /> Repeticiones
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" /> Duración
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" /> Descanso
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <StickyNote className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" /> Notas
            </div>
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
                {/* Cabecera de Días y Nombre Personalizado */}
                <div className="flex flex-col items-center gap-3 mb-6 bg-gray-900/60 p-4 rounded-2xl border border-gray-700/60">
                  {/* Selector de Días dinámicos */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: trainingDays }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDay(d);
                          setEditingDayName(false);
                        }}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                          d === day
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        Día {d} {dayNames[d] ? `· ${dayNames[d]}` : ""}
                      </button>
                    ))}
                  </div>

                  {/* Edición de Nombre del Día Actual */}
                  <div className="flex items-center gap-2 mt-1">
                    {editingDayName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Ej: Pierna, Pecho y Tríceps...`}
                          value={dayNameInput}
                          onChange={(e) => setDayNameInput(e.target.value)}
                          className="bg-gray-800 border border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={saveDayName}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingDayName(false)}
                          className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-600 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setDayNameInput(dayNames[day] || "");
                          setEditingDayName(true);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 cursor-pointer bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700/60 hover:bg-gray-700/80 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {dayNames[day] ? `Nombre: "${dayNames[day]}" (Cambiar)` : `Nombrar el Día ${day}`}
                      </button>
                    )}
                  </div>

                  {/* Botones de Plantillas de Semana */}
                  <div className="flex flex-wrap gap-2 justify-center mt-2 pt-3 border-t border-gray-700/50 w-full">
                    <button
                      onClick={fetchWeekTemplates}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      📁 Cargar Plantilla de Semana
                    </button>
                    <button
                      onClick={() => setShowSaveTemplateModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      💾 Guardar Semana como Plantilla
                    </button>
                  </div>
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

                      {/* Lista de ejercicios con Drag & Drop */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {exGroup.map((ex) => (
                          <motion.div
                            key={ex.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, ex.id)}
                            onDragOver={(e) => handleDragOver(e, ex.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, ex.id)}
                            whileHover={{ scale: 1.01 }}
                            className={`relative border bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 transition-all duration-200 ${
                              dragOverId === ex.id
                                ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/30"
                                : "border-gray-700/50"
                            } ${draggedId === ex.id ? "opacity-40" : "opacity-100"}`}
                          >
                            {/* Handle para arrastrar */}
                            <div
                              className="absolute top-3 left-3 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-700/50"
                              title="Arrastra para reordenar"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            {editing === ex.id ? (
                              /* Modo edición - layout vertical */
                              <div className="space-y-2">
                                {ex.catalogo_ejercicios?.imagen && (
                                  <img
                                    src={ex.catalogo_ejercicios.imagen}
                                    alt={ex.catalogo_ejercicios.nombre}
                                    className="w-full h-24 md:h-40 object-cover rounded-lg mb-2"
                                  />
                                )}
                                <input
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2 text-sm"
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
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2 text-sm"
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
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2 text-sm"
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
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-2 text-sm"
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
                                    className="px-3 py-1 bg-gray-600 rounded-lg hover:bg-gray-700 text-white text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => saveEdit(ex.id)}
                                    className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 text-white text-sm"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Modo visualización - layout horizontal en móvil */
                              <div className="flex gap-3">
                                {/* Imagen thumbnail */}
                                {ex.catalogo_ejercicios?.imagen && (
                                  <img
                                    src={ex.catalogo_ejercicios.imagen}
                                    alt={ex.catalogo_ejercicios.nombre}
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-full md:h-36 object-cover rounded-lg flex-shrink-0 md:hidden"
                                  />
                                )}
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  {/* Imagen visible solo en desktop, arriba del contenido */}
                                  {ex.catalogo_ejercicios?.imagen && (
                                    <img
                                      src={ex.catalogo_ejercicios.imagen}
                                      alt={ex.catalogo_ejercicios.nombre}
                                      className="hidden md:block w-full h-36 object-cover rounded-lg mb-2"
                                    />
                                  )}
                                  <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-100 text-sm md:text-base truncate pr-2">
                                      {ex.catalogo_ejercicios?.nombre}
                                    </p>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                      <Edit2
                                        className="w-4 h-4 md:w-5 md:h-5 text-blue-400 hover:text-blue-300 cursor-pointer"
                                        onClick={() => startEdit(ex)}
                                      />
                                      <Trash2
                                        className="w-4 h-4 md:w-5 md:h-5 text-red-400 hover:text-red-300 cursor-pointer"
                                        onClick={() =>
                                          deleteExercise(
                                            ex.id,
                                            ex.catalogo_ejercicios?.nombre
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs md:text-sm mt-1">
                                    {ex.n_reps && (
                                      <div className="flex items-center gap-1">
                                        <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
                                        <span>{ex.n_reps}</span>
                                      </div>
                                    )}
                                    {ex.duracion && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
                                        <span>{ex.duracion}</span>
                                      </div>
                                    )}
                                    {ex.descanso && (
                                      <div className="flex items-center gap-1">
                                        <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
                                        <span>{ex.descanso}</span>
                                      </div>
                                    )}
                                    {ex.descripcion && (
                                      <div className="flex items-center gap-1 w-full mt-0.5">
                                        <StickyNote className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300 flex-shrink-0" />
                                        <span className="truncate">{ex.descripcion}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                  <div className="bg-gray-900 p-3 md:p-4 rounded-xl border border-gray-700/50 mt-4">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-100">
                      Selecciona un ejercicio del catálogo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {catalog.map((cat) => (
                        <motion.div
                          key={cat.id}
                          className="border border-gray-700 rounded-lg p-3 md:p-4 bg-gray-800"
                        >
                          {cat.imagen && (
                            <img
                              src={cat.imagen}
                              alt={cat.nombre}
                              className="w-full h-20 md:h-32 object-cover rounded-lg mb-2 md:mb-3"
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
      {/* Modales de Plantillas */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Plantillas de Semana Guardadas</h3>
            {weekTemplates.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No tienes plantillas guardadas aún.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {weekTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700"
                  >
                    <div>
                      <p className="font-bold text-gray-200 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.days} días de entrenamiento</p>
                    </div>
                    <button
                      onClick={() => applyTemplateToClient(t)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowTemplatesModal(false)}
              className="w-full py-2.5 bg-gray-700 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-600 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-100 mb-2">Guardar como Plantilla</h3>
            <p className="text-xs text-gray-400 mb-4">Guarda la semana completa de ejercicios como una plantilla reutilizable.</p>
            <input
              type="text"
              placeholder="Nombre (ej: Rutina Hipertrofia 5 días)"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="flex-1 py-2.5 bg-gray-700 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveCurrentWeekAsTemplate}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
