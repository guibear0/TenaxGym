// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ExerciseCatalog({
  catalog,
  showAddForm,
  handleAddClick,
  formValues,
  setFormValues,
  addExercise,
}) {
  // Orden deseado
  const tipoOrder = [
    "calentamiento",
    "bloque_fuerza",
    "estabilidad_cardio",
    "cardio",
  ];

  // Estado buscador
  const [searchTerm, setSearchTerm] = useState("");

  // Normalizar texto (eliminar tildes y pasar a minúsculas)
  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Filtrar ejercicios según búsqueda
  const filteredCatalog = catalog.filter((item) =>
    normalize(item.nombre).includes(normalize(searchTerm))
  );

  // Agrupar ejercicios por tipo para los bloques retraíbles
  const groupedCatalog = tipoOrder.map((tipo) => ({
    tipo,
    items: catalog.filter((item) => item.tipo.toLowerCase() === tipo),
  }));

  // Estado para secciones expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState(
    tipoOrder.reduce((acc, tipo) => ({ ...acc, [tipo]: false }), {})
  );

  const toggleSection = (tipo) => {
    setExpandedSections((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  return (
    <div className="mt-10">
      {/* 🔍 Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ✅ Si hay búsqueda */}
      {searchTerm ? (
        <div>
          <h4 className="text-lg text-gray-100 font-semibold mb-4">
            Resultados de búsqueda
          </h4>
          {filteredCatalog.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 hover:border-blue-500 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-50"></div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-100">
                        {item.nombre}
                      </p>
                      <p className="text-sm text-gray-400">{item.tipo}</p>
                    </div>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer"
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
                    <div className="mt-4 space-y-3 relative z-10">
                      <input
                        placeholder="Repeticiones"
                        className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              No se encontraron ejercicios.
            </p>
          )}
        </div>
      ) : (
        /* ✅ Bloques retraíbles normales si no hay búsqueda */
        groupedCatalog.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.tipo} className="mb-6">
                <motion.div
                  className="flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
                  onClick={() => toggleSection(group.tipo)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections[group.tipo]}
                  aria-label={`Toggle ${group.tipo.toUpperCase()} section`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleSection(group.tipo);
                    }
                  }}
                >
                  <h4 className="font-semibold text-lg text-gray-100">
                    {group.tipo.toUpperCase()}
                  </h4>
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
                            <div className="relative z-10 flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-100">
                                  {item.nombre}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {item.tipo}
                                </p>
                              </div>
                              <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer"
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
                              <div className="mt-4 space-y-3 relative z-10">
                                <input
                                  placeholder="Repeticiones"
                                  className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={formValues.n_reps}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      n_reps: e.target.value,
                                    })
                                  }
                                />
                                <button
                                  onClick={() => addExercise(item.id)}
                                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                                >
                                  Guardar
                                </button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
        )
      )}
    </div>
  );
}
