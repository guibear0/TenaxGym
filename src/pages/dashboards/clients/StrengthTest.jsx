import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  X,
  LineChart as LineChartIcon,
} from "lucide-react";
import BackButton from "../../../components/ui/BackButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
//hola
export default function StrengthTest() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [marca, setMarca] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [imagen, setImagen] = useState("");

  const ejerciciosFuerza = [
    "Sentadilla",
    "Press Banca",
    "Peso Muerto",
    "Press Militar",
    "Dominadas",
    "Remo",
    "Hip Thrust",
    "Curl Bíceps",
    "Press Francés",
  ];

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.id;

  useEffect(() => {
    fetchResultados();
  }, []);

  const fetchResultados = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("test_resultados")
        .select("*")
        .eq("user_id", userId)
        .eq("tipo", "fuerza")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setResultados(data || []);
    } catch (err) {
      toast.error("Error al cargar resultados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExercise || !marca || !fecha) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      const { error } = await supabase.from("test_resultados").insert([
        {
          user_id: userId,
          tipo: "fuerza",
          ejercicio: selectedExercise,
          marca: parseFloat(marca),
          fecha: fecha,
          imagen: imagen || null,
        },
      ]);

      if (error) throw error;

      toast.success(`Marca de ${selectedExercise} registrada correctamente`);
      setShowModal(false);
      resetForm();
      fetchResultados();
    } catch (err) {
      if (err.code === "23505") {
        toast.error("Ya existe una marca para este ejercicio en esta fecha");
      } else {
        toast.error("Error al guardar: " + err.message);
      }
    }
  };

  const deleteResultado = async (id, ejercicio) => {
    try {
      const { error } = await supabase
        .from("test_resultados")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`${ejercicio} eliminado correctamente`);
      fetchResultados();
    } catch (err) {
      toast.error("Error al eliminar: " + err.message);
    }
  };

  const resetForm = () => {
    setSelectedExercise("");
    setMarca("");
    setFecha(new Date().toISOString().split("T")[0]);
    setImagen("");
  };

  const groupByExercise = () => {
    const grouped = {};
    resultados.forEach((r) => {
      if (!grouped[r.ejercicio]) {
        grouped[r.ejercicio] = [];
      }
      grouped[r.ejercicio].push(r);
    });
    return grouped;
  };

  const groupedResults = groupByExercise();

  const prepareChartData = (marcas) => {
    return marcas
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((m) => ({
        fecha: new Date(m.fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        marca: parseFloat(m.marca),
        fechaCompleta: new Date(m.fecha).toLocaleDateString("es-ES"),
      }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton label="Atrás" to="/tests" />
          <h1 className="text-3xl md:text-4xl font-bold">
            Test de Fuerza - RM
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-200 font-medium cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Registrar Marca
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-center text-gray-400">Cargando...</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedResults).map(([ejercicio, marcas]) => (
              <motion.div
                key={ejercicio}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
              >
                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  {ejercicio}
                </h3>

                {/* Gráfico de evolución */}
                {marcas.length >= 2 && (
                  <div className="mb-6 bg-gray-900/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <LineChartIcon className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">
                        Evolución
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={prepareChartData(marcas)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="fecha"
                          stroke="#9CA3AF"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          style={{ fontSize: "12px" }}
                          domain={["dataMin - 5", "dataMax + 5"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value) => [`${value} kg`, "Marca"]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fechaCompleta;
                            }
                            return label;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="marca"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: "#3B82F6", r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-3">
                  {marcas.map((resultado) => (
                    <div
                      key={resultado.id}
                      className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            {new Date(resultado.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {resultado.marca} kg
                        </div>
                        {resultado.imagen && (
                          <img
                            src={resultado.imagen}
                            alt="Evidencia"
                            className="mt-2 w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <button
                        onClick={() =>
                          deleteResultado(resultado.id, resultado.ejercicio)
                        }
                        className="ml-4 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-5 h-5 cursor-pointer" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 relative"
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

                <h2 className="text-2xl font-bold mb-6 ">Registrar Marca</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ejercicio *
                    </label>
                    <select
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">-- Selecciona --</option>
                      {ejerciciosFuerza.map((ej) => (
                        <option key={ej} value={ej}>
                          {ej}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Marca (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="Ej: 100 kg"
                      required
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
                      required
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
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-medium"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
