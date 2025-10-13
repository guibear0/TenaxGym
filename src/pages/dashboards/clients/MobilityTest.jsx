import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, X, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/ui/BackButton";
import toast from "react-hot-toast";

export default function MobilityTest() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [marca, setMarca] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [imagen, setImagen] = useState("");
  const [error, setError] = useState(null);

  const ejerciciosMovilidad = {
    Hombros: [
      "Rotación Interna Izquierda",
      "Rotación Interna Derecha",
      "Rotación Externa Izquierda",
      "Rotación Externa Derecha",
    ],
    Overhead: [
      "Overhead Flexión Izquierda",
      "Overhead Flexión Derecha",
      "Overhead Squat",
    ],
    Tórax: ["Rotación Derecha", "Rotación Izquierda"],
    Caderas: [
      "Rotación Interna Izquierda",
      "Rotación Interna Derecha",
      "Flexión Izquierda",
      "Flexión Derecha",
      "Abducción Izquierda",
      "Abducción Derecha",
    ],
    "Cadera Posterior": ["Flexibilidad Izquierda", "Flexibilidad Derecha"],
    Tobillos: ["Flexión Izquierda", "Flexión Derecha"],
  };

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.id;

  useEffect(() => {
    if (userId) fetchResultados();
  }, [userId]);

  const fetchResultados = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("test_resultados")
        .select("*")
        .eq("user_id", userId)
        .eq("tipo", "movilidad")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setResultados(data || []);
    } catch (err) {
      setError("No se pudieron cargar los datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExercise || !marca || !fecha) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    try {
      const newResult = {
        user_id: userId,
        tipo: "movilidad",
        ejercicio: selectedExercise,
        marca: parseFloat(marca),
        fecha,
        imagen: imagen || null,
      };

      const { data, error } = await supabase
        .from("test_resultados")
        .insert([newResult])
        .select();

      if (error) throw error;
      setResultados([data[0], ...resultados]);
      setShowModal(false);
      resetForm();
      toast.success("Marca guardada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la marca");
    }
  };

  const deleteResultado = async (id) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from("test_resultados")
        .delete()
        .eq("id", deleteTarget);

      if (error) throw error;
      setResultados((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast.success("Marca eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.error("No se pudo eliminar la marca");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedExercise("");
    setMarca("");
    setFecha(new Date().toISOString().split("T")[0]);
    setImagen("");
  };

  const getBaseName = (ejercicio) =>
    ejercicio.replace(/ (Izquierda|Derecha)$/, "");

  const hasSideVariants = (ejercicio) =>
    ejercicio.endsWith("Izquierda") || ejercicio.endsWith("Derecha");

  const groupByCategory = () => {
    const grouped = {};
    Object.keys(ejerciciosMovilidad).forEach((c) => (grouped[c] = {}));

    resultados.forEach((r) => {
      const cat = Object.entries(ejerciciosMovilidad).find(([_, ejs]) =>
        ejs.includes(r.ejercicio)
      );
      if (!cat) return;

      const categoria = cat[0];
      const key = hasSideVariants(r.ejercicio)
        ? getBaseName(r.ejercicio)
        : r.ejercicio;

      grouped[categoria][key] ||= {
        isGrouped: hasSideVariants(r.ejercicio),
        left: [],
        right: [],
        single: [],
      };

      if (r.ejercicio.endsWith("Izquierda"))
        grouped[categoria][key].left.push(r);
      else if (r.ejercicio.endsWith("Derecha"))
        grouped[categoria][key].right.push(r);
      else grouped[categoria][key].single.push(r);
    });

    return Object.fromEntries(
      Object.entries(grouped).filter(([_, ejs]) => Object.keys(ejs).length > 0)
    );
  };

  const groupedResults = groupByCategory();

  const prepareChartDataCombined = (leftData, rightData) => {
    const allDates = [
      ...new Set([
        ...leftData.map((d) => d.fecha),
        ...rightData.map((d) => d.fecha),
      ]),
    ].sort();

    return allDates.map((fecha) => {
      const leftItem = leftData.find((d) => d.fecha === fecha);
      const rightItem = rightData.find((d) => d.fecha === fecha);

      return {
        fecha: new Date(fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        izquierda: leftItem ? parseFloat(leftItem.marca) : null,
        derecha: rightItem ? parseFloat(rightItem.marca) : null,
      };
    });
  };

  const prepareChartDataSingle = (marcas) => {
    return marcas
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((m) => ({
        fecha: new Date(m.fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        marca: parseFloat(m.marca),
      }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <BackButton label="Atrás" />
          <h1 className="text-3xl md:text-4xl font-bold">Test de Movilidad</h1>
          <div className="w-20"></div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Registrar Marca
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-gray-400 mt-4">Cargando...</p>
          </div>
        ) : Object.keys(groupedResults).length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 text-lg">
              No hay marcas registradas todavía
            </p>
            <p className="text-gray-500 mt-2">
              Haz clic en "Registrar Marca" para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([categoria, ejercicios]) => (
              <div key={categoria} className="space-y-4">
                <h2 className="text-2xl font-bold text-blue-300 border-b border-blue-500/30 pb-2">
                  {categoria}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ejercicios).map(([ejercicio, data]) => {
                    const hasLeftData = data.left.length > 0;
                    const hasRightData = data.right.length > 0;
                    const hasSingleData = data.single.length > 0;
                    const allData = [
                      ...data.left,
                      ...data.right,
                      ...data.single,
                    ];

                    return (
                      <motion.div
                        key={ejercicio}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1E2A44] rounded-xl p-4 shadow-lg"
                      >
                        <h3 className="text-white font-bold text-base mb-3">
                          {ejercicio}
                        </h3>

                        {/* Gráfico de evolución */}
                        {allData.length >= 2 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                              </svg>
                              <span className="text-white text-xs font-medium">
                                Evolución
                              </span>
                            </div>

                            <ResponsiveContainer width="100%" height={150}>
                              <LineChart
                                data={
                                  data.isGrouped &&
                                  (hasLeftData || hasRightData)
                                    ? prepareChartDataCombined(
                                        data.left,
                                        data.right
                                      )
                                    : prepareChartDataSingle(allData)
                                }
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#374151"
                                  strokeOpacity={0.3}
                                />
                                <XAxis
                                  dataKey="fecha"
                                  stroke="#9CA3AF"
                                  style={{ fontSize: "10px" }}
                                  tick={{ fill: "#9CA3AF" }}
                                />
                                <YAxis
                                  stroke="#9CA3AF"
                                  style={{ fontSize: "10px" }}
                                  tick={{ fill: "#9CA3AF" }}
                                  domain={["dataMin - 2", "dataMax + 2"]}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                  }}
                                  formatter={(value) => [`${value} cm`]}
                                />
                                {data.isGrouped && hasLeftData && (
                                  <Line
                                    type="monotone"
                                    dataKey="izquierda"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: "#3B82F6", r: 3 }}
                                    connectNulls
                                  />
                                )}
                                {data.isGrouped && hasRightData && (
                                  <Line
                                    type="monotone"
                                    dataKey="derecha"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    dot={{ fill: "#F59E0B", r: 3 }}
                                    connectNulls
                                  />
                                )}
                                {!data.isGrouped && (
                                  <Line
                                    type="monotone"
                                    dataKey="marca"
                                    stroke="#00C853"
                                    strokeWidth={2}
                                    dot={{ fill: "#00C853", r: 3 }}
                                  />
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Lista de registros */}
                        {/* Lista estilo tarjeta personalizada */}
                        <div className="space-y-3">
                          {[...data.left, ...data.right, ...data.single].map(
                            (r) => (
                              <div
                                key={r.id}
                                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 flex items-center justify-between"
                              >
                                <div>
                                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>
                                      {new Date(r.fecha).toLocaleDateString(
                                        "es-ES"
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-xl font-bold text-white">
                                    {r.marca} cm
                                    {r.ejercicio.includes("Izquierda") && (
                                      <span className="ml-2 text-blue-400 text-sm">
                                        (Izq)
                                      </span>
                                    )}
                                    {r.ejercicio.includes("Derecha") && (
                                      <span className="ml-2 text-amber-400 text-sm">
                                        (Der)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteResultado(r.id)}
                                  className="text-red-400 hover:text-red-300 transition cursor-pointer"
                                >
                                  <Trash2 className="w-5 h-5 " />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition "
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Registrar Marca</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Categoría *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedExercise("");
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">-- Selecciona Categoría --</option>
                      {Object.keys(ejerciciosMovilidad).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ejercicio *
                      </label>
                      <select
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">-- Selecciona Ejercicio --</option>
                        {ejerciciosMovilidad[selectedCategory].map((ej) => (
                          <option key={ej} value={ej}>
                            {ej}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marca (cm) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="Ej: 15.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL de Imagen (Opcional)
                    </label>
                    <input
                      type="url"
                      value={imagen}
                      onChange={(e) => setImagen(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-medium"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
              >
                <h3 className="text-xl font-bold mb-4 text-white">
                  Confirmar eliminación
                </h3>
                <p className="text-gray-300 mb-6">
                  ¿Estás seguro de que deseas eliminar esta marca? Esta acción
                  no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
              >
                <h3 className="text-xl font-bold mb-4 text-white">
                  Confirmar eliminación
                </h3>
                <p className="text-gray-300 mb-6">
                  ¿Estás seguro de que deseas eliminar esta marca? Esta acción
                  no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
