//eslint-disable-next-line
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Clock, Repeat, RotateCcw, StickyNote, Trash2, Edit2 } from "lucide-react";
import {toast,Toaster} from "react-hot-toast";

export default function ClientExercisesAdmin({ clientId: propClientId }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(propClientId || "");
  const [day, setDay] = useState(1);
  const [catalog, setCatalog] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  //eslint-disable-next-line
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
        setCatalog(data || []);
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
    } catch (err) {
      alert("Error al añadir: " + err.message);
    }
  };

    const deleteExercise = async (exerciseId) => {
  toast((t) => (
    <span>
      ¿Eliminar este ejercicio?
      <button
        onClick={async () => {
          const { error } = await supabase
            .from("ejercicios_cliente")
            .delete()
            .eq("id", exerciseId);
          if (!error) {
            setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
            toast.success("Ejercicio eliminado");
          } else {
            toast.error("Error al eliminar");
          }
          toast.dismiss(t.id);
        }}
        className="ml-3 px-2 py-1 bg-red-600 text-white rounded"
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
    }
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto p-6">
      {/* === Guía lateral === */}
      <aside className="w-48 space-y-4">
        <h3 className="font-semibold text-lg">Guía</h3>
        <div className="flex items-center gap-2 text-sm">
          <Repeat className="w-5 h-5 text-gray-600" /> Repeticiones
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-5 h-5 text-gray-600" /> Duración
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RotateCcw className="w-5 h-5 text-gray-600" /> Descanso
        </div>
        <div className="flex items-center gap-2 text-sm">
          <StickyNote className="w-5 h-5 text-gray-600" /> Nota del entrenador
        </div>
      </aside>

      {/* === Panel principal === */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Gestión de ejercicios</h2>

        {!propClientId && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Selecciona cliente</label>
            <select
              className="border p-2 rounded w-full"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">-- Elegir cliente --</option>
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
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-4 py-2 rounded ${
                    d === day ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  Día {d}
                </button>
              ))}
            </div>

            {loading ? (
              <p>Cargando...</p>
            ) : exercises.length === 0 ? (
              <p className="text-gray-500">No hay ejercicios.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex) => (
                  <motion.div
                    key={ex.id}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded p-4 bg-white shadow-sm relative"
                  >
                    {editing === ex.id ? (
                      <div className="space-y-2">
                        <input
                          placeholder="Reps"
                          className="border p-1 rounded w-full"
                          value={editValues.n_reps}
                          onChange={(e) =>
                            setEditValues({ ...editValues, n_reps: e.target.value })
                          }
                        />
                        <input
                          placeholder="Duración"
                          className="border p-1 rounded w-full"
                          value={editValues.duracion}
                          onChange={(e) =>
                            setEditValues({ ...editValues, duracion: e.target.value })
                          }
                        />
                        <input
                          placeholder="Descanso"
                          className="border p-1 rounded w-full"
                          value={editValues.descanso}
                          onChange={(e) =>
                            setEditValues({ ...editValues, descanso: e.target.value })
                          }
                        />
                        <input
                          placeholder="Descripción"
                          className="border p-1 rounded w-full"
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
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold">
                          {ex.catalogo_ejercicios?.nombre}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          {ex.n_reps && (
                            <div className="flex items-center gap-2">
                              <Repeat className="w-4 h-4 text-gray-600" />
                              <span>{ex.n_reps}</span>
                            </div>
                          )}
                          {ex.duracion && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span>{ex.duracion}</span>
                            </div>
                          )}
                          {ex.descanso && (
                            <div className="flex items-center gap-2">
                              <RotateCcw className="w-4 h-4 text-gray-600" />
                              <span>{ex.descanso}</span>
                            </div>
                          )}
                          {ex.descripcion && (
                            <div className="flex items-center gap-2">
                              <StickyNote className="w-4 h-4 text-gray-600" />
                              <span>{ex.descripcion}</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => startEdit(ex)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteExercise(ex.id)}
                            className="text-red-600 hover:text-red-800"
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
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Añadir del catálogo</h3>
              {loadingCatalog ? (
                <p>Cargando catálogo...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catalog.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="border rounded p-3 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-sm text-gray-500">{item.tipo}</p>
                        </div>
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            showAddForm === item.id
                              ? setShowAddForm(null)
                              : handleAddClick(item.id)
                          }
                        >
                          {showAddForm === item.id ? "Cerrar" : "Añadir"}
                        </button>
                      </div>
                      {showAddForm === item.id && (
                        <div className="mt-3 space-y-2">
                          <input
                            placeholder="Reps"
                            className="border p-1 rounded w-full"
                            value={formValues.n_reps}
                            onChange={(e) =>
                              setFormValues({
                                ...formValues,
                                n_reps: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Duración"
                            className="border p-1 rounded w-full"
                            value={formValues.duracion}
                            onChange={(e) =>
                              setFormValues({
                                ...formValues,
                                duracion: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Descanso"
                            className="border p-1 rounded w-full"
                            value={formValues.descanso}
                            onChange={(e) =>
                              setFormValues({
                                ...formValues,
                                descanso: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Descripción"
                            className="border p-1 rounded w-full"
                            value={formValues.descripcion}
                            onChange={(e) =>
                              setFormValues({
                                ...formValues,
                                descripcion: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => addExercise(item.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Guardar
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
       <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "8px",
            background: "#fff",
            color: "#333",
          },
        }}
      />
    </div>
    
  );
}
