import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Info } from "lucide-react";
import { useState } from "react";

/**
 * TMBPanel — Tasa Metabólica Basal (Mifflin-St Jeor)
 * Hombre: TMB = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) + 5
 * Mujer:  TMB = (10 × peso_kg) + (6.25 × altura_cm) - (5 × edad) - 161
 *
 * Props:
 *   peso        {number}  kg
 *   altura      {number}  cm
 *   sexo        {string}  "Hombre" | "Mujer"
 *   fechaNac    {string}  ISO date string (birth_date)
 */
export default function TMBPanel({ peso, altura, sexo, fechaNac }) {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const edad = useMemo(() => {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let age = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) age--;
    return age;
  }, [fechaNac]);

  const tmb = useMemo(() => {
    const p = parseFloat(peso);
    const h = parseFloat(altura);
    const e = parseFloat(edad);
    if (!p || !h || !e || isNaN(p) || isNaN(h) || isNaN(e)) return null;
    if (p <= 0 || h <= 0 || e <= 0) return null;

    const base = 10 * p + 6.25 * h - 5 * e;
    if (sexo === "Mujer") return Math.round(base - 161);
    return Math.round(base + 5); // Hombre u otro
  }, [peso, altura, sexo, edad]);

  const faltaDato = !peso || !altura || !fechaNac || !sexo;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gray-800/80 rounded-xl border border-orange-500/30 shadow text-center"
      >
        <h4 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Tasa Metabólica Basal
          <Info
            className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer"
            onClick={() => setMostrarInfo((s) => !s)}
          />
        </h4>

        {faltaDato ? (
          <p className="text-sm text-gray-500 italic">
            Faltan datos necesarios: peso, altura, fecha de nacimiento y sexo.
          </p>
        ) : tmb === null ? (
          <p className="text-sm text-gray-500 italic">
            No se puede calcular con los datos actuales.
          </p>
        ) : (
          <>
            <p className="text-4xl font-black text-orange-400">
              {tmb.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">kcal/día</p>
            <p className="text-xs text-gray-500 mt-2">
              Fórmula Mifflin-St Jeor · {sexo} · {edad} años
            </p>
          </>
        )}

        <AnimatePresence>
          {mostrarInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-3 bg-gray-700/40 rounded-lg text-sm text-gray-300 overflow-hidden text-left"
            >
              <p className="mb-2">
                La <strong>Tasa Metabólica Basal</strong> es la energía mínima que tu
                cuerpo necesita en reposo para mantener sus funciones vitales.
              </p>
              <p className="mb-2 font-medium text-orange-300">Fórmula Mifflin-St Jeor:</p>
              <p className="text-xs font-mono bg-gray-900/60 px-3 py-2 rounded mb-1">
                Hombre: (10×kg) + (6.25×cm) − (5×edad) + 5
              </p>
              <p className="text-xs font-mono bg-gray-900/60 px-3 py-2 rounded mb-3">
                Mujer: (10×kg) + (6.25×cm) − (5×edad) − 161
              </p>
              <p className="text-xs text-gray-500 italic">
                Este valor corresponde a metabolismo basal. El gasto real varía según
                nivel de actividad física.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
