import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RegistroPerimetroPar({
  nombreIzq,
  campoIzq,
  nombreDer,
  campoDer,
  userId,
  datosHistoricos,
  ultimaMedicionIzq,
  ultimaMedicionDer,
  isExpanded,
  onToggleExpand,
  onSaved,
}) {
  const [valorIzq, setValorIzq] = useState("");
  const [valorDer, setValorDer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  const datosGrafica = useMemo(() => {
    return datosHistoricos
      .filter((d) => d[campoIzq] != null || d[campoDer] != null)
      .map((d, idx) => ({
        fecha:
          new Date(d.fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          }) + `-${idx}`,
        [campoIzq]: d[campoIzq] ? parseFloat(d[campoIzq]) : null,
        [campoDer]: d[campoDer] ? parseFloat(d[campoDer]) : null,
        fechaCompleta: new Date(d.fecha).toLocaleDateString("es-ES"),
      }));
  }, [datosHistoricos, campoIzq, campoDer]);

  const handleSave = async () => {
    if (!valorIzq || !valorDer || isNaN(valorIzq) || isNaN(valorDer)) {
      return toast.error("Introduce valores válidos en ambos lados");
    }

    toast.success("Guardando...");
    setLoading(true);
    const fechaHoy = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("perimetros")
      .upsert(
        {
          user_id: userId,
          fecha: fechaHoy,
          [campoIzq]: parseFloat(valorIzq),
          [campoDer]: parseFloat(valorDer),
        },
        { onConflict: ["user_id", "fecha"] }
      )
      .select();

    setLoading(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else if (data && data.length) {
      toast.success(
        `Guardado correctamente en ${nombreIzq.replace(" Izq", "")}`
      );
      setValorIzq("");
      setValorDer("");
      onSaved(data[0]);
      setShowInputs(false);
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
        <h3 className="text-xl font-bold text-blue-400">
          {nombreIzq.replace(" Izq", "")}
        </h3>
        <button
          onClick={() => setShowInputs((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Añadir ambos
        </button>
      </div>

      {/* Última medición */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Izquierda</p>
          <p className="text-2xl font-bold">{ultimaMedicionIzq ?? "—"} cm</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Derecha</p>
          <p className="text-2xl font-bold">{ultimaMedicionDer ?? "—"} cm</p>
        </div>
      </div>

      {/* Inputs */}
      <AnimatePresence>
        {showInputs && (
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <input
              type="number"
              step="0.1"
              value={valorIzq}
              onChange={(e) => setValorIzq(e.target.value)}
              placeholder={`Nuevo ${nombreIzq}`}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-600 text-white w-32"
            />
            <input
              type="number"
              step="0.1"
              value={valorDer}
              onChange={(e) => setValorDer(e.target.value)}
              placeholder={`Nuevo ${nombreDer}`}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-600 text-white w-32"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
            >
              Guardar ambos
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
                dataKey={campoIzq}
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ fill: "#4ade80", r: 4 }}
                name={nombreIzq}
              />
              <Line
                type="monotone"
                dataKey={campoDer}
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: "#60a5fa", r: 4 }}
                name={nombreDer}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
