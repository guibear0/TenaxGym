import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RegistroPerimetroPar({
  nombreIzq,
  campoIzq,
  nombreDer,
  campoDer,
  userId,
  datosHistoricos,
  ultimaMedicionIzq,
  ultimaMedicionDer,
  onSaved,
}) {
  const [valorIzq, setValorIzq] = useState("");
  const [valorDer, setValorDer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type: "", message: "" }), 3000);
  };

  const handleSave = async () => {
    if (!valorIzq || !valorDer || isNaN(valorIzq) || isNaN(valorDer)) {
      return showToast("Introduce valores válidos en ambos lados", "error");
    }

    showToast("Guardando...", "info");
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
      showToast("Error al guardar: " + error.message, "error");
    } else if (data && data.length) {
      showToast(`Guardado correctamente en ${nombreIzq} y ${nombreDer}`, "success");
      setValorIzq("");
      setValorDer("");
      onSaved(data[0]);
      setShowInputs(false);
    }
  };

  const datosGrafica = useMemo(() => {
    return datosHistoricos
      .filter((d) => d[campoIzq] != null || d[campoDer] != null)
      .map((d, idx) => ({
        fecha: new Date(d.fecha).toLocaleDateString() + `-${idx}`,
        [campoIzq]: d[campoIzq],
        [campoDer]: d[campoDer],
      }));
  }, [datosHistoricos, campoIzq, campoDer]);

  return (
    <motion.div
      className="flex flex-col p-4 bg-gray-800/80 rounded-xl border border-gray-700/50 shadow w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <p>
          {nombreIzq}: <span className="font-bold">{ultimaMedicionIzq ?? "Sin datos"} cm</span>
        </p>
        <p>
          {nombreDer}: <span className="font-bold">{ultimaMedicionDer ?? "Sin datos"} cm</span>
        </p>
        <button
          onClick={() => setShowInputs((s) => !s)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
        >
          Añadir ambos
        </button>
        <button
          onClick={() => setShowChart((s) => !s)}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium"
        >
          {showChart ? "Ocultar gráfica" : "Mostrar gráfica"}
        </button>
      </div>

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

      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg text-white ${
            toast.type === "success" ? "bg-green-600" :
            toast.type === "error" ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showChart && datosGrafica.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
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
            <Line
              type="monotone"
              dataKey={campoIzq}
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ r: 4 }}
              name={nombreIzq}
            />
            <Line
              type="monotone"
              dataKey={campoDer} 
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 4 }}
              name={nombreDer}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {showChart && datosGrafica.length === 0 && (
        <p className="text-gray-400 text-sm text-center">Sin datos históricos</p>
      )}
    </motion.div>
  );
}
