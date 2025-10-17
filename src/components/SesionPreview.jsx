// eslint-disable-next-line
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Trash2, Pencil, X, Plus, Search, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SesionPreview({ session, onClose, updateSessionName }) {
  if (!session) return null;

  const [sessionName, setSessionName] = useState(session.nombre);
  const [editingSessionName, setEditingSessionName] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [catalogExercises, setCatalogExercises] = useState([]);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseValues, setExerciseValues] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    fetchSessionExercises();
    fetchCatalogExercises();
  }, [session.id]);

  const fetchSessionExercises = async () => {
    const { data, error } = await supabase
      .from("sesion_ejercicios")
      .select("*, catalogo_ejercicios(*)")
      .eq("sesion_id", session.id)
      .order("orden", { ascending: true });

    if (!error) setExercises(data || []);
  };

  const fetchCatalogExercises = async () => {
    const { data, error } = await supabase
      .from("catalogo_ejercicios")
      .select("*")
      .order("tipo", { ascending: true });

    if (!error) setCatalogExercises(data || []);
  };

  const saveSessionName = async () => {
    try {
      await supabase
        .from("sesiones")
        .update({ nombre: sessionName })
        .eq("id", session.id);

      updateSessionName(session.id, sessionName);
      toast.success("Nombre de sesión actualizado");
      setEditingSessionName(false);
    } catch (err) {
      toast.error("Error guardando nombre: " + err.message);
    }
  };

  const deleteExercise = async (exerciseId) => {
    try {
      await supabase.from("sesion_ejercicios").delete().eq("id", exerciseId);
      setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
      toast.success("Ejercicio eliminado");
    } catch (err) {
      toast.error("Error eliminando ejercicio: " + err.message);
    }
  };

  const startEditExercise = (exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseValues({
      n_reps: exercise.n_reps,
      duracion: exercise.duracion,
      descanso: exercise.descanso,
      descripcion: exercise.descripcion,
    });
  };

  const cancelEditExercise = () => {
    setEditingExerciseId(null);
    setExerciseValues({});
  };

  const saveExercise = async (exerciseId) => {
    try {
      await supabase
        .from("sesion_ejercicios")
        .update(exerciseValues)
        .eq("id", exerciseId);

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, ...exerciseValues } : ex
        )
      );
      toast.success("Ejercicio actualizado");
      cancelEditExercise();
    } catch (err) {
      toast.error("Error guardando ejercicio: " + err.message);
    }
  };

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

    const draggedIndex = exercises.findIndex((ex) => ex.id === draggedId);
    const targetIndex = exercises.findIndex((ex) => ex.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newExercises = [...exercises];
    const [draggedExercise] = newExercises.splice(draggedIndex, 1);
    newExercises.splice(targetIndex, 0, draggedExercise);

    setExercises(newExercises);

    try {
      for (let i = 0; i < newExercises.length; i++) {
        await supabase
          .from("sesion_ejercicios")
          .update({ orden: i + 1 })
          .eq("id", newExercises[i].id);
      }
      toast.success("Orden actualizado");
    } catch (err) {
      toast.error("Error actualizando orden: " + err.message);
    }

    setDraggedId(null);
  };

  const addExerciseToSession = async (catalog) => {
    try {
      const { data, error } = await supabase
        .from("sesion_ejercicios")
        .insert([
          {
            sesion_id: session.id,
            catalogo_id: catalog.id,
            orden: exercises.length + 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setExercises((prev) => [
        ...prev,
        { ...data, catalogo_ejercicios: catalog },
      ]);
      toast.success("Ejercicio añadido");
    } catch (err) {
      toast.error("Error añadiendo ejercicio: " + err.message);
    }
  };

  const availableCatalog = catalogExercises.filter(
    (c) => !exercises.some((e) => e.catalogo_id === c.id)
  );

  const filteredCatalog = availableCatalog.filter(
    (cat) =>
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-6 p-6 bg-gray-800/80 rounded-2xl relative">
      {/* Nombre de sesión */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        {editingSessionName ? (
          <>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 flex-1"
            />
            <div className="flex gap-2">
              <button
                onClick={saveSessionName}
                className="text-blue-500 hover:text-blue-400 cursor-pointer transition"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingSessionName(false);
                  setSessionName(session.nombre);
                }}
                className="text-red-600 hover:text-red-500 cursor-pointer transition"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl italic text-blue-400">{sessionName}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSessionName(true)}
                className="text-blue-500 hover:text-blue-400 cursor-pointer transition"
              >
                <Pencil />
              </button>
              <button
                onClick={onClose}
                className="text-red-600 hover:text-red-500 cursor-pointer transition"
              >
                <X />
              </button>
            </div>
          </>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Ejercicios de la sesión</h3>
        {exercises.length === 0 && (
          <p className="text-gray-400">No hay ejercicios añadidos</p>
        )}
      </div>
      {/* Ejercicios añadidos agrupados por tipo */}
      {["CALENTAMIENTO", "BLOQUE_FUERZA", "ESTABILIDAD_CARDIO", "CARDIO"].map(
        (tipo) => {
          const ejerciciosPorTipo = exercises.filter(
            (ex) => ex.catalogo_ejercicios?.tipo === tipo
          );

          if (ejerciciosPorTipo.length === 0) return null;

          return (
            <div key={tipo} className="mt-4">
              <h3 className="font-semibold text-lg">{tipo}</h3>
              {ejerciciosPorTipo.map((ex) => (
                <div
                  key={ex.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ex.id)}
                  onDragOver={(e) => handleDragOver(e, ex.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, ex.id)}
                  className={`p-2 border rounded-lg mt-1 relative cursor-move transition ${
                    draggedId === ex.id
                      ? "opacity-50 border-blue-500 bg-blue-900/20"
                      : dragOverId === ex.id
                        ? "border-green-500 bg-green-900/20"
                        : "border-gray-700"
                  }`}
                >
                  {editingExerciseId === ex.id ? (
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={exerciseValues.n_reps || ""}
                        onChange={(e) =>
                          setExerciseValues((prev) => ({
                            ...prev,
                            n_reps: e.target.value,
                          }))
                        }
                        placeholder="Reps"
                        className="px-2 py-1 rounded-lg bg-gray-900 text-white border border-gray-600"
                      />
                      <input
                        type="text"
                        value={exerciseValues.duracion || ""}
                        onChange={(e) =>
                          setExerciseValues((prev) => ({
                            ...prev,
                            duracion: e.target.value,
                          }))
                        }
                        placeholder="Duración"
                        className="px-2 py-1 rounded-lg bg-gray-900 text-white border border-gray-600"
                      />
                      <input
                        type="text"
                        value={exerciseValues.descanso || ""}
                        onChange={(e) =>
                          setExerciseValues((prev) => ({
                            ...prev,
                            descanso: e.target.value,
                          }))
                        }
                        placeholder="Descanso"
                        className="px-2 py-1 rounded-lg bg-gray-900 text-white border border-gray-600"
                      />
                      <input
                        type="text"
                        value={exerciseValues.descripcion || ""}
                        onChange={(e) =>
                          setExerciseValues((prev) => ({
                            ...prev,
                            descripcion: e.target.value,
                          }))
                        }
                        placeholder="Descripción"
                        className="px-2 py-1 rounded-lg bg-gray-900 text-white border border-gray-600"
                      />
                      <button
                        onClick={() => saveExercise(ex.id)}
                        className="text-blue-500 hover:text-blue-400 cursor-pointer transition"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEditExercise}
                        className="text-red-600 hover:text-red-500 cursor-pointer transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical size={18} className="text-gray-500" />
                        <span>
                          {ex.catalogo_ejercicios.nombre} — {ex.n_reps} reps,{" "}
                          {ex.duracion} seg, Descanso: {ex.descanso},{" "}
                          {ex.descripcion}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditExercise(ex)}
                          className="text-blue-500 hover:text-blue-400 cursor-pointer transition"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteExercise(ex.id)}
                          className="text-red-600 hover:text-red-500 cursor-pointer transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }
      )}

      {/* Catálogo de ejercicios */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Catálogo de ejercicios</h3>

        {/* Buscador */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar ejercicios por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {filteredCatalog.length === 0 && searchTerm && (
          <p className="text-gray-400 text-center">
            No se encontraron ejercicios
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredCatalog.map((cat) => (
            <div
              key={cat.id}
              className="p-2 border border-gray-700 rounded-lg flex justify-between items-center hover:border-gray-600 transition"
            >
              <div className="flex-1">
                <span className="font-medium">{cat.nombre}</span>
                <div className="text-sm text-gray-400">{cat.tipo}</div>
              </div>
              <button
                onClick={() => addExerciseToSession(cat)}
                className="text-green-500 hover:text-green-400 cursor-pointer transition ml-2"
              >
                <Plus />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
