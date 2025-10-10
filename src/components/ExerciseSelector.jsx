// eslint-disable-next-line
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function ExerciseSelector({
  sessionId,
  addedExercises,
  refreshExercises,
}) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  const tipoOrder = [
    "CALENTAMIENTO",
    "BLOQUE_FUERZA",
    "ESTABILIDAD_CARDIO",
    "CARDIO",
  ];
  const tipoDisplayMapping = {
    CALENTAMIENTO: "Calentamiento",
    BLOQUE_FUERZA: "Fuerza",
    ESTABILIDAD_CARDIO: "Estabilidad",
    CARDIO: "Cardio",
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("catalogo_ejercicios")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCatalog(data || []);
    } catch (err) {
      toast.error("Error cargando catálogo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addExerciseToSession = async (exercise) => {
    try {
      const { data, error } = await supabase
        .from("sesion_ejercicios")
        .insert([
          {
            sesion_id: sessionId,
            catalogo_id: exercise.id,
            orden: 0, // se puede ajustar después
            n_reps: "",
            duracion: "",
            descanso: "",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      toast.success("Ejercicio añadido");
      refreshExercises();
    } catch (err) {
      toast.error("Error añadiendo ejercicio: " + err.message);
    }
  };

  // Filtrar ejercicios ya añadidos
  const availableExercises = catalog.filter(
    (ex) => !addedExercises.some((ae) => ae.catalogo_id === ex.id)
  );

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-xl mb-2">Añadir Ejercicios</h3>
      {loading ? (
        <p>Cargando catálogo...</p>
      ) : availableExercises.length === 0 ? (
        <p className="text-gray-400">Todos los ejercicios ya están añadidos</p>
      ) : (
        tipoOrder.map((tipo) => {
          const filtered = availableExercises.filter((ex) => ex.tipo === tipo);
          if (filtered.length === 0) return null;
          return (
            <div key={tipo} className="mb-4">
              <h4 className="font-semibold mb-2">{tipoDisplayMapping[tipo]}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex justify-between items-center p-2 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <span>{ex.nombre}</span>
                    <button
                      onClick={() => addExerciseToSession(ex)}
                      className="px-2 py-1 bg-blue-600 rounded-lg"
                    >
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
