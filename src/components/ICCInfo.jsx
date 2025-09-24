import { useState, useMemo } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function ICCPanel({ datosHistoricos, sexo }) {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const ultimaCintura = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d.cintura != null);
    return last ? last.cintura : null;
  }, [datosHistoricos]);

  const ultimaCadera = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d.cadera != null);
    return last ? last.cadera : null;
  }, [datosHistoricos]);

  const icc =
    ultimaCintura && ultimaCadera ? ultimaCintura / ultimaCadera : null;

  const getInterpretacion = (valor) => {
    if (sexo === "Mujer") {
      if (valor < 0.8) return { texto: "Bajo", color: "text-green-400" };
      if (valor >= 0.8 && valor < 0.9)
        return { texto: "Moderado", color: "text-yellow-400" };
      if (valor >= 0.9) return { texto: "Alto", color: "text-orange-400" };
    } else {
      // Hombre
      if (valor < 0.9) return { texto: "Bajo", color: "text-green-400" };
      if (valor >= 0.9 && valor <= 1)
        return { texto: "Moderado", color: "text-yellow-400" };
      if (valor > 1) return { texto: "Alto", color: "text-orange-400" };
    }
  };

  const { texto: riesgoICC, color: colorICC } = icc
    ? getInterpretacion(icc)
    : {};

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
  <p className="mb-3">
    El ICC se calcula dividiendo el perímetro de la cintura entre el
    perímetro de la cadera. Valores altos indican mayor riesgo
    cardiovascular <br/> en función del sexo de la persona.
  </p>

  <div className="overflow-x-auto">
    <table className="w-full text-center border rounded-lg text-xs sm:text-sm">
      <thead>
        <tr className=" text-gray-200">
          <th colSpan="3" className="px-2 py-2 border border-gray-600">
            Interpretación del ICC
          </th>
        </tr>
        <tr className="bg-gray-700 text-gray-200">
          <th className="px-2 py-1 border border-gray-600">Mujeres</th>
          <th className="px-2 py-1 border border-gray-600">Riesgo</th>
          <th className="px-2 py-1 border border-gray-600">Hombres</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-2 py-1 border border-gray-600">&lt; 0.80</td>
          <td className="px-2 py-1 border border-gray-600 text-green-400">
            Bajo
          </td>
          <td className="px-2 py-1 border border-gray-600">&lt; 0.90</td>
        </tr>
        <tr>
          <td className="px-2 py-1 border border-gray-600">0.80 – 0.90</td>
          <td className="px-2 py-1 border border-gray-600 text-yellow-400">
            Moderado
          </td>
          <td className="px-2 py-1 border border-gray-600">0.90 – 1.00</td>
        </tr>
        <tr>
          <td className="px-2 py-1 border border-gray-600">&gt; 0.90</td>
          <td className="px-2 py-1 border border-gray-600 text-orange-400">
            Alto
          </td>
          <td className="px-2 py-1 border border-gray-600">&gt; 1.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p className="mt-3 font-medium text-blue-300">
    Tu sexo registrado es: {sexo}.
  </p>
</motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
