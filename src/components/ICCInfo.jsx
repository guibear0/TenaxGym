import { useState, useMemo } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function ICCPanel({ datosHistoricos,sexo }) {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const ultimaCintura = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d.cintura != null);
    return last ? last.cintura : null;
  }, [datosHistoricos]);

  const ultimaCadera = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d.cadera != null);
    return last ? last.cadera : null;
  }, [datosHistoricos]);

  const icc = ultimaCintura && ultimaCadera ? ultimaCintura / ultimaCadera : null;

  const getInterpretacion = (valor) => {
    if (sexo === "Mujer") {
      if (valor < 0.8) return { texto: "Bajo", color: "text-green-400" };
      if (valor >= 0.8 && valor < 0.9) return { texto: "Moderado", color: "text-yellow-400" };
      if (valor >= 0.9 && valor <= 1) return { texto: "Alto", color: "text-orange-400" };
      return { texto: "Muy alto", color: "text-red-500" };
    } else { // Hombre
      if (valor < 0.9) return { texto: "Bajo", color: "text-green-400" };
      if (valor >= 0.9 && valor <= 1) return { texto: "Moderado", color: "text-yellow-400" };
      return { texto: "Alto", color: "text-orange-400" };
    }
  };

  const { texto: riesgoICC, color: colorICC } = icc ? getInterpretacion(icc) : {};

  if (!icc) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-gray-800/80 rounded-xl border border-gray-700/50 shadow text-center relative"
    >
      <h4 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
        Índice Cintura/Cadera
        <Info
          className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
          onClick={() => setMostrarInfo((s) => !s)}
        />
      </h4>
      <p className={`text-2xl font-bold ${colorICC}`}>
        {icc.toFixed(2)} ({riesgoICC})
      </p>

      <AnimatePresence>
        {mostrarInfo && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-3 bg-gray-700/40 rounded-lg text-sm text-gray-300"
          >
            El ICC se calcula dividiendo el perímetro de la cintura entre el
            perímetro de la cadera. Valores altos indican mayor riesgo
            cardiovascular. Tu sexo es {sexo}.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
