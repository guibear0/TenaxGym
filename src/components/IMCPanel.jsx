import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function BMInfo({ peso, altura, className = "" }) {
  const [mostrarInf, setMostrarInfo] = useState(false);

  if (!peso || !altura) return null;

  const imc = peso / ((altura) ** 2);

  const getInterpretacion = (valor) => {
    if (valor < 18.5) return { texto: "Bajo peso", color: "text-green-400" };
    if (valor >= 18.5 && valor < 25) return { texto: "Normal", color: "text-green-400" };
    if (valor >= 25 && valor < 30) return { texto: "Sobrepeso", color: "text-yellow-400" };
    if (valor >= 30) return { texto: "Obesidad", color: "text-orange-400" };
  };

  const { texto: riesgoIMC, color: colorIMC } = getInterpretacion(imc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`mt-6 p-6 bg-gray-800/80 rounded-xl border border-gray-700/50 shadow text-center relative h-full ${className}`}
    >
      <h4 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
        Índice de Masa Corporal
        <Info
          className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
          onClick={() => setMostrarInfo((s) => !s)}
        />
      </h4>

      <p className={`text-2xl font-bold ${colorIMC}`}>
        {imc.toFixed(2)} ({riesgoIMC})
      </p>

      <AnimatePresence>
        {mostrarInf && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-3 bg-gray-700/40 rounded-lg text-xs sm:text-sm text-gray-300 overflow-x-auto"
          >
            <p className="mb-3">
              El IMC se calcula dividiendo el peso (kg) entre la altura al cuadrado (m²). Indica el estado nutricional general.
            </p>

            <table className="w-full text-center border border-gray-600 rounded-lg mb-3">
              <thead>
                <tr className="bg-gray-700 text-gray-200">
                  <th className="px-2 py-1 border border-gray-600">IMC</th>
                  <th className="px-2 py-1 border border-gray-600">Clasificación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1 border border-gray-600">&lt; 18.5</td>
                  <td className="px-2 py-1 border border-gray-600 text-green-400">Bajo peso</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-600">18.5 – 24.9</td>
                  <td className="px-2 py-1 border border-gray-600 text-green-400">Normal</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-600">25 – 29.9</td>
                  <td className="px-2 py-1 border border-gray-600 text-yellow-400">Sobrepeso</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border border-gray-600">≥ 30</td>
                  <td className="px-2 py-1 border border-gray-600 text-orange-400">Obesidad</td>
                </tr>
              </tbody>
            </table>
            <i>Asegúrate de discutir preguntas específicas sobre tu salud y tratamientos con un profesional de la salud</i>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
