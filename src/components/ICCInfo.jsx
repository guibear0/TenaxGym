import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function ICCPanel({ datosHistoricos, sexo }) {
  const [mostrarInf, setMostrarInfo] = useState(false);

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
      if (valor < 0.9) return { texto: "Bajo", color: "text-green-400" };
      if (valor >= 0.9 && valor <= 1)
        return { texto: "Moderado", color: "text-yellow-400" };
      if (valor > 1) return { texto: "Alto", color: "text-orange-400" };
    }
  };

  if (!icc) return null;
  const { texto: riesgoICC, color: colorICC } = getInterpretacion(icc);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gray-800/80 rounded-xl border border-gray-700/50 shadow text-center"
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
          {mostrarInf && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-3 bg-gray-700/40 rounded-lg text-sm text-gray-300 overflow-hidden"
            >
              <p className="mb-3">
                El ICC se calcula dividiendo el perímetro de la cintura entre el
                perímetro de la cadera. Valores altos indican mayor riesgo
                cardiovascular según el sexo.
              </p>

              <table className="w-full text-center border border-gray-600 rounded-lg">
                <thead>
                  <tr className="bg-gray-700 text-gray-200">
                    <th className="px-2 py-1 border border-gray-600">
                      Mujeres
                    </th>
                    <th className="px-2 py-1 border border-gray-600">Riesgo</th>
                    <th className="px-2 py-1 border border-gray-600">
                      Hombres
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600">
                      &lt; 0.80
                    </td>
                    <td className="px-2 py-1 border border-gray-600 text-green-400">
                      Bajo
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      &lt; 0.90
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600">
                      0.80 – 0.90
                    </td>
                    <td className="px-2 py-1 border border-gray-600 text-yellow-400">
                      Moderado
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      0.90 – 1.00
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600">
                      &gt; 0.90
                    </td>
                    <td className="px-2 py-1 border border-gray-600 text-orange-400">
                      Alto
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      &gt; 1.00
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="mt-3 font-medium text-blue-300">
                Tu sexo registrado es: {sexo}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
