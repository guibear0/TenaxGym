/* eslint-disable */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import {
  Activity,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CAMPOS_BIO = [
  { campo: "masa_grasa", label: "Masa Grasa", unidad: "%", color: "#f97316" },
  { campo: "masa_magra", label: "Masa Magra", unidad: "kg", color: "#4ade80" },
  { campo: "agua", label: "Agua", unidad: "%", color: "#60a5fa" },
  { campo: "masa_osea", label: "Masa Ósea", unidad: "kg", color: "#c084fc" },
];

/**
 * RegistroBioimpedancia
 * Props:
 *   userId        {string}  ID del usuario
 *   datosHistoricos {array} registros de perimetros del usuario
 *   onSaved       {fn}      callback cuando se guarda un nuevo dato
 *   readOnly      {bool}    si true, solo muestra datos sin formulario de edición
 */
export default function RegistroBioimpedancia({
  userId,
  datosHistoricos = [],
  onSaved,
  readOnly = false,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({
    masa_grasa: "",
    masa_magra: "",
    agua: "",
    masa_osea: "",
    otros_bioimpedancia: "",
  });
  const [saving, setSaving] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);

  // Filtrar registros que tengan al menos un dato de bioimpedancia
  const historialBio = useMemo(
    () =>
      datosHistoricos.filter(
        (d) =>
          d.masa_grasa != null ||
          d.masa_magra != null ||
          d.agua != null ||
          d.masa_osea != null ||
          d.otros_bioimpedancia != null
      ),
    [datosHistoricos]
  );

  const ultimoRegistro = useMemo(() => {
    if (!historialBio.length) return null;
    return [...historialBio].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )[0];
  }, [historialBio]);

  const handleFormChange = (campo, valor) => {
    setFormValues((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar que al menos un campo numérico tenga valor
    const hayNumerico = CAMPOS_BIO.some(
      ({ campo }) =>
        formValues[campo] !== "" && !isNaN(parseFloat(formValues[campo]))
    );
    if (!hayNumerico && !formValues.otros_bioimpedancia.trim()) {
      toast.error("Introduce al menos un valor de bioimpedancia");
      return;
    }

    // Validar rangos razonables
    for (const { campo, label } of CAMPOS_BIO) {
      const val = formValues[campo];
      if (val !== "" && (isNaN(parseFloat(val)) || parseFloat(val) < 0 || parseFloat(val) > 1000)) {
        toast.error(`${label}: valor inválido`);
        return;
      }
    }

    setSaving(true);
    try {
      const fechaHoy = new Date().toISOString().split("T")[0];
      const dataToInsert = { user_id: userId, fecha: fechaHoy };

      CAMPOS_BIO.forEach(({ campo }) => {
        if (formValues[campo] !== "") {
          dataToInsert[campo] = parseFloat(formValues[campo]);
        }
      });

      if (formValues.otros_bioimpedancia.trim()) {
        dataToInsert.otros_bioimpedancia = formValues.otros_bioimpedancia.trim();
      }

      const { data, error } = await supabase
        .from("perimetros")
        .upsert(dataToInsert, { onConflict: ["user_id", "fecha"] })
        .select();

      if (error) throw error;

      toast.success("Bioimpedancia guardada correctamente");
      setFormValues({
        masa_grasa: "",
        masa_magra: "",
        agua: "",
        masa_osea: "",
        otros_bioimpedancia: "",
      });
      setShowForm(false);
      onSaved?.(data[0]);
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const datosGrafica = (campo) =>
    historialBio
      .filter((d) => d[campo] != null)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((d, idx) => ({
        fecha:
          new Date(d.fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          }) + `-${idx}`,
        valor: parseFloat(d[campo]),
        fechaCompleta: new Date(d.fecha).toLocaleDateString("es-ES"),
      }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-purple-400">Bioimpedancia</h3>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancelar
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Registrar
              </>
            )}
          </button>
        )}
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && !readOnly && (
          <motion.form
            key="bio-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="bg-gray-900/50 rounded-xl p-4 mb-5 space-y-3 border border-gray-700/50">
              <p className="text-sm text-gray-400 mb-3">
                Introduce los datos de tu báscula de bioimpedancia:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CAMPOS_BIO.map(({ campo, label, unidad }) => (
                  <div key={campo}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {label} ({unidad})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValues[campo]}
                      onChange={(e) => handleFormChange(campo, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Otros (texto libre)
                </label>
                <textarea
                  rows={2}
                  value={formValues.otros_bioimpedancia}
                  onChange={(e) =>
                    handleFormChange("otros_bioimpedancia", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Ej: Metabolismo basal: 1450 kcal, Edad metabólica: 28..."
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar bioimpedancia"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Últimos valores */}
      {historialBio.length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4">
          Sin registros de bioimpedancia
        </p>
      ) : (
        <>
          {/* Grid de valores actuales */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CAMPOS_BIO.map(({ campo, label, unidad, color }) => {
              const valor = ultimoRegistro?.[campo];
              return (
                <div
                  key={campo}
                  className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/40"
                >
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: valor != null ? color : undefined }}
                  >
                    {valor != null ? (
                      <>
                        {parseFloat(valor).toFixed(1)}
                        <span className="text-sm font-normal text-gray-400 ml-1">
                          {unidad}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Otros */}
          {ultimoRegistro?.otros_bioimpedancia && (
            <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/40 mb-4">
              <p className="text-xs text-gray-400 mb-1">Otros</p>
              <p className="text-sm text-gray-200">
                {ultimoRegistro.otros_bioimpedancia}
              </p>
            </div>
          )}

          {/* Gráficas por campo */}
          {CAMPOS_BIO.map(({ campo, label, unidad, color }) => {
            const datos = datosGrafica(campo);
            if (datos.length < 2) return null;
            const isExpanded = expandedChart === campo;
            return (
              <div key={campo} className="mb-3">
                <button
                  onClick={() => setExpandedChart(isExpanded ? null : campo)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? "Ocultar" : "Ver"} evolución {label}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-2 bg-gray-900/30 rounded-xl p-4"
                    >
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={datos}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="fecha"
                            stroke="#9CA3AF"
                            style={{ fontSize: "11px" }}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: "11px" }}
                            domain={["dataMin - 1", "dataMax + 1"]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                            formatter={(val) => [`${val} ${unidad}`, label]}
                            labelFormatter={(label, payload) =>
                              payload?.[0]?.payload?.fechaCompleta || label
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="valor"
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color, r: 4 }}
                            name={label}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Historial resumido */}
          {historialBio.length > 1 && (
            <p className="text-xs text-gray-500 text-right mt-2">
              {historialBio.length} registros en total
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}
