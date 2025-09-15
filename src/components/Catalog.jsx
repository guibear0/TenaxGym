//eslint-disable-next-line
import { motion } from "framer-motion";

export default function ExerciseCatalog({
  catalog,
  showAddForm,
  handleAddClick,
  formValues,
  setFormValues,
  addExercise,
}) {
  // Orden deseado
  const tipoOrder = ["calentamiento", "bloque_fuerza", "estabilidad_cardio", "cardio"];

  // Agrupar ejercicios por tipo
  const groupedCatalog = tipoOrder.map((tipo) => ({
    tipo,
    items: catalog.filter((item) => item.tipo.toLowerCase() === tipo),
  }));

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Añadir del catálogo</h3>
      {groupedCatalog.map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.tipo} className="mb-4 border rounded p-3 bg-gray-50">
              <h4 className="font-semibold mb-2 cursor-pointer">{group.tipo.toUpperCase()}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item) => (
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
                            ? handleAddClick(null)
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
                            setFormValues({ ...formValues, n_reps: e.target.value })
                          }
                        />
                        <input
                          placeholder="Duración"
                          className="border p-1 rounded w-full"
                          value={formValues.duracion}
                          onChange={(e) =>
                            setFormValues({ ...formValues, duracion: e.target.value })
                          }
                        />
                        <input
                          placeholder="Descanso"
                          className="border p-1 rounded w-full"
                          value={formValues.descanso}
                          onChange={(e) =>
                            setFormValues({ ...formValues, descanso: e.target.value })
                          }
                        />
                        <input
                          placeholder="Descripción"
                          className="border p-1 rounded w-full"
                          value={formValues.descripcion}
                          onChange={(e) =>
                            setFormValues({ ...formValues, descripcion: e.target.value })
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
            </div>
          )
      )}
    </div>
  );
}
