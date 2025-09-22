import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RegistroPerimetro({
  nombre,
  campo,
  userId,
  datosHistoricos,
  ultimaMedicion,
  onSaved,
}) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type, message: "" }), 3000);
  };

  const handleSave = async () => {
    if (!valor || isNaN(valor)) return showToast("Introduce un valor válido", "error");

    showToast("Guardando...", "info");
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
      showToast("Error al guardar: " + error.message, "error");
    } else if (data && data.length) {
      showToast("Guardado exitosamente", "success");
      setValor("");
      onSaved(data[0]);
      setShowInput(false);
    }
  };

  const datosGrafica = useMemo(() => {
    return datosHistoricos
      .filter((d) => d[campo] != null)
      .map((d, idx) => ({
        fecha: new Date(d.fecha).toLocaleDateString() + `-${idx}`,
        valor: d[campo],
      }));
  }, [datosHistoricos, campo]);

  return (

    
    <motion.div
      className="flex flex-col p-4 bg-gray-800/80 rounded-xl border border-gray-700/50 shadow w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <p>
          {nombre}: <span className="font-bold">{ultimaMedicion ?? "Sin datos"} cm</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInput((s) => !s)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
          >
            Añadir
          </button>
          <button
            onClick={() => setShowChart((s) => !s)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
          >
            {showChart ? "Ocultar gráfica" : "Mostrar gráfica"}
          </button>
        </div>
      </div>

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

      {showChart && datosGrafica.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={datosGrafica}>
            <XAxis dataKey="fecha" />
            <YAxis 
            domain={[
                (dataMin) => dataMin - 2, // baja un poco el mínimo
                (dataMax) => dataMax + 2  // sube un poco el máximo
                ]}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || !payload.length) return null;
                return (
                  <div className="bg-gray-800/90 p-2 rounded-lg border border-gray-700 text-white text-sm">
                    <p>{label}</p>
                    {payload.map((p, i) => (
                      <p key={i}>
                        {p.name}: {p.value ?? "–"} cm
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="valor" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} name={nombre} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-sm text-center">{showChart ? "Sin datos históricos" : ""}</p>
      )}

      {toast.visible && (
  <motion.div
    key={toast.message}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white font-medium z-50 ${
      toast.type === "success"
        ? "bg-green-500"
        : toast.type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    }`}
  >
    {toast.message}
  </motion.div>
)}

    </motion.div>
  );
}
