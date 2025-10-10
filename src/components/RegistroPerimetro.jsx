import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RegistroPerimetro({
  nombre,
  campo,
  userId,
  datosHistoricos,
  ultimaMedicion,
  isExpanded,
  onToggleExpand,
  onSaved,
}) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const datosGrafica = useMemo(() => {
    return datosHistoricos
      .filter((d) => d[campo] != null)
      .map((d, idx) => ({
        fecha:
          new Date(d.fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          }) + `-${idx}`,
        valor: parseFloat(d[campo]),
        fechaCompleta: new Date(d.fecha).toLocaleDateString("es-ES"),
      }));
  }, [datosHistoricos, campo]);

  const handleSave = async () => {
    if (!valor || isNaN(valor)) return toast.error("Introduce un valor válido");

    toast.success("Guardando...");
    setLoading(true);

    const fechaHoy = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("perimetros")
      .upsert(
        { user_id: userId, fecha: fechaHoy, [campo]: parseFloat(valor) },
        { onConflict: ["user_id", "fecha"] }
      )
      .select();

    setLoading(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else if (data && data.length) {
      toast.success("Guardado exitosamente");
      setValor("");
      onSaved(data[0]);
      setShowInput(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 w-full self-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">{nombre}</h3>
        <button
          onClick={() => setShowInput((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {/* Última medición */}
      <p className="text-sm text-gray-400">Último valor</p>
      <p className="text-2xl font-bold mb-2">{ultimaMedicion ?? "—"} cm</p>

      {/* Input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            className="flex gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <input
              type="number"
              step="0.1"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={`Nuevo ${nombre}`}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-600 text-white w-32"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
            >
              Guardar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de expansión */}
      {datosGrafica.length >= 2 && (
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-3"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {isExpanded ? "Ocultar" : "Ver"} evolución
        </button>
      )}

      {/* Gráfico */}
      {isExpanded && datosGrafica.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900/30 p-4 rounded-xl"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="fecha"
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fechaCompleta || label
                }
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ fill: "#4ade80", r: 4 }}
                name={nombre}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
