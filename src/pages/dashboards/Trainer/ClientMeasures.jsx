/* eslint-disable */
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
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
import { ChevronDown, ChevronUp, ArrowLeft, Ruler, Activity, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

import ICCPanel from "../../../components/ICCInfo";
import BMInfo from "../../../components/IMCPanel";

const CAMPOS_INDIVIDUALES = [
  { nombre: "Pecho", campo: "pecho", color: "#4ade80" },
  { nombre: "Cintura", campo: "cintura", color: "#facc15" },
  { nombre: "Cadera", campo: "cadera", color: "#f97316" },
];

const CAMPOS_PARES = [
  {
    nombreIzq: "Bíceps Izq",
    campoIzq: "biceps_izq",
    nombreDer: "Bíceps Der",
    campoDer: "biceps_der",
    colorIzq: "#4ade80",
    colorDer: "#60a5fa",
  },
  {
    nombreIzq: "Bíceps Contraído Izq",
    campoIzq: "biceps_contraido_izq",
    nombreDer: "Bíceps Contraído Der",
    campoDer: "biceps_contraido_der",
    colorIzq: "#4ade80",
    colorDer: "#60a5fa",
  },
  {
    nombreIzq: "Muslo Izq",
    campoIzq: "muslo_izq",
    nombreDer: "Muslo Der",
    campoDer: "muslo_der",
    colorIzq: "#4ade80",
    colorDer: "#60a5fa",
  },
  {
    nombreIzq: "Gemelo Izq",
    campoIzq: "gemelo_izq",
    nombreDer: "Gemelo Der",
    campoDer: "gemelo_der",
    colorIzq: "#4ade80",
    colorDer: "#60a5fa",
  },
];

// === Componente de solo lectura para perímetro individual ===
function PerimetroReadOnly({ nombre, campo, datosHistoricos, color = "#4ade80" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const ultimaMedicion = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d[campo] != null);
    return last ? parseFloat(last[campo]) : null;
  }, [datosHistoricos, campo]);

  const primeraMedicion = useMemo(() => {
    const first = datosHistoricos.find((d) => d[campo] != null);
    return first ? parseFloat(first[campo]) : null;
  }, [datosHistoricos, campo]);

  const diferencia = ultimaMedicion && primeraMedicion
    ? (ultimaMedicion - primeraMedicion).toFixed(1)
    : null;

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

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 w-full self-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-400">{nombre}</h3>
        {diferencia !== null && (
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              parseFloat(diferencia) > 0
                ? "bg-green-900/40 text-green-400"
                : parseFloat(diferencia) < 0
                ? "bg-red-900/40 text-red-400"
                : "bg-gray-700/40 text-gray-400"
            }`}
          >
            {parseFloat(diferencia) > 0 ? "+" : ""}
            {diferencia} cm
          </span>
        )}
      </div>

      {/* Última medición */}
      <p className="text-sm text-gray-400">Último valor</p>
      <p className="text-2xl font-bold mb-2">{ultimaMedicion ?? "—"} cm</p>

      {/* Botón de expansión */}
      {datosGrafica.length >= 2 && (
        <button
          onClick={() => setIsExpanded((s) => !s)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-3 cursor-pointer"
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
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                name={nombre}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {datosGrafica.length < 2 && datosGrafica.length > 0 && (
        <p className="text-xs text-gray-500 italic">Se necesitan al menos 2 registros para mostrar la evolución</p>
      )}
      {datosGrafica.length === 0 && (
        <p className="text-xs text-gray-500 italic">Sin registros</p>
      )}
    </motion.div>
  );
}

// === Componente de solo lectura para perímetro par ===
function PerimetroParReadOnly({
  nombreIzq,
  campoIzq,
  nombreDer,
  campoDer,
  datosHistoricos,
  colorIzq = "#4ade80",
  colorDer = "#60a5fa",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const ultimaMedicionIzq = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d[campoIzq] != null);
    return last ? parseFloat(last[campoIzq]) : null;
  }, [datosHistoricos, campoIzq]);

  const ultimaMedicionDer = useMemo(() => {
    const last = [...datosHistoricos].reverse().find((d) => d[campoDer] != null);
    return last ? parseFloat(last[campoDer]) : null;
  }, [datosHistoricos, campoDer]);

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

  // Calcular asimetría
  const asimetria =
    ultimaMedicionIzq && ultimaMedicionDer
      ? Math.abs(ultimaMedicionIzq - ultimaMedicionDer).toFixed(1)
      : null;

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
        {asimetria !== null && parseFloat(asimetria) > 0 && (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-amber-900/40 text-amber-400">
            Δ {asimetria} cm
          </span>
        )}
      </div>

      {/* Últimas mediciones */}
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

      {/* Botón de expansión */}
      {datosGrafica.length >= 2 && (
        <button
          onClick={() => setIsExpanded((s) => !s)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-3 cursor-pointer"
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
                stroke={colorIzq}
                strokeWidth={2}
                dot={{ fill: colorIzq, r: 4 }}
                name={nombreIzq}
              />
              <Line
                type="monotone"
                dataKey={campoDer}
                stroke={colorDer}
                strokeWidth={2}
                dot={{ fill: colorDer, r: 4 }}
                name={nombreDer}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {datosGrafica.length < 2 && datosGrafica.length > 0 && (
        <p className="text-xs text-gray-500 italic">Se necesitan al menos 2 registros para mostrar la evolución</p>
      )}
      {datosGrafica.length === 0 && (
        <p className="text-xs text-gray-500 italic">Sin registros</p>
      )}
    </motion.div>
  );
}

// === Componente principal: Vista de medidas para el entrenador ===
export default function ClientMeasures({ clientId, onBack }) {
  const [clientProfile, setClientProfile] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch client profile
  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, email, weight, height, sexo")
          .eq("id", clientId)
          .single();
        if (error) throw error;
        setClientProfile(data);
      } catch (err) {
        toast.error("Error al cargar perfil del cliente: " + err.message);
      }
    };
    if (clientId) fetchClientProfile();
  }, [clientId]);

  // Fetch perimetros
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("perimetros")
          .select("*")
          .eq("user_id", clientId)
          .order("fecha", { ascending: true });
        if (!error) {
          setHistorico(data || []);
        } else {
          toast.error("Error al cargar mediciones");
        }
      } catch (err) {
        toast.error("Error: " + err.message);
      }
      setLoading(false);
    };
    if (clientId) fetchData();
  }, [clientId]);

  // Conteo de mediciones totales
  const totalRegistros = historico.length;
  const ultimaFecha = totalRegistros > 0
    ? new Date(historico[historico.length - 1].fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      key="client-measures"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a clientes
          </button>
        </div>

        {/* Título y info del cliente */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
            Mediciones de{" "}
            <span className="text-blue-400">
              {clientProfile?.name || "..."}
            </span>
          </h2>
          {clientProfile?.email && (
            <p className="text-gray-400 mt-1">{clientProfile.email}</p>
          )}
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center"
          >
            <Ruler className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Altura</p>
            <p className="text-xl font-bold">
              {clientProfile?.height ? `${clientProfile.height} cm` : "—"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center"
          >
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Peso</p>
            <p className="text-xl font-bold">
              {clientProfile?.weight ? `${clientProfile.weight} kg` : "—"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 text-center"
          >
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Registros</p>
            <p className="text-xl font-bold">{totalRegistros}</p>
            {ultimaFecha && (
              <p className="text-xs text-gray-500 mt-1">Último: {ultimaFecha}</p>
            )}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : historico.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700/50"
          >
            <Ruler className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Este cliente aún no tiene mediciones registradas</p>
            <p className="text-gray-500 text-sm mt-2">Las mediciones aparecerán aquí cuando el cliente las registre</p>
          </motion.div>
        ) : (
          <>
            {/* Pecho */}
            <div className="mb-6">
              <PerimetroReadOnly
                nombre="Pecho"
                campo="pecho"
                datosHistoricos={historico}
                color="#4ade80"
              />
            </div>

            {/* Cintura y Cadera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start">
              <PerimetroReadOnly
                nombre="Cintura"
                campo="cintura"
                datosHistoricos={historico}
                color="#facc15"
              />
              <PerimetroReadOnly
                nombre="Cadera"
                campo="cadera"
                datosHistoricos={historico}
                color="#f97316"
              />
            </div>

            {/* Campos Pares */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6 items-start">
              {CAMPOS_PARES.map(
                ({ nombreIzq, campoIzq, nombreDer, campoDer, colorIzq, colorDer }) => (
                  <PerimetroParReadOnly
                    key={`${campoIzq}-${campoDer}`}
                    nombreIzq={nombreIzq}
                    campoIzq={campoIzq}
                    nombreDer={nombreDer}
                    campoDer={campoDer}
                    datosHistoricos={historico}
                    colorIzq={colorIzq}
                    colorDer={colorDer}
                  />
                )
              )}
            </div>

            {/* Paneles ICC e IMC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ICCPanel
                  datosHistoricos={historico}
                  sexo={clientProfile?.sexo}
                />
              </div>
              <div>
                <BMInfo
                  peso={clientProfile?.weight}
                  altura={clientProfile?.height ? clientProfile.height / 100 : null}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
