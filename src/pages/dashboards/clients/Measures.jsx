import { useEffect, useState } from "react";
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
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import BackButton from "../../../components/ui/BackButton";
import { toast } from "react-hot-toast";

import ICCPanel from "../../../components/ICCInfo";
import BMInfo from "../../../components/IMCPanel";
import RegistroPerimetro from "../../../components/RegistroPerimetro";
import RegistroPerimetroPar from "../../../components/RegistroPerimetroPar";

const CAMPOS_INDIVIDUALES = [
  { nombre: "Pecho", campo: "pecho" },
  { nombre: "Cintura", campo: "cintura" },
  { nombre: "Cadera", campo: "cadera" },
];

const CAMPOS_PARES = [
  {
    nombreIzq: "Bíceps Izq",
    campoIzq: "biceps_izq",
    nombreDer: "Bíceps Der",
    campoDer: "biceps_der",
  },
  {
    nombreIzq: "Bíceps Contraído Izq",
    campoIzq: "biceps_contraido_izq",
    nombreDer: "Bíceps Contraído Der",
    campoDer: "biceps_contraido_der",
  },
  {
    nombreIzq: "Muslo Izq",
    campoIzq: "muslo_izq",
    nombreDer: "Muslo Der",
    campoDer: "muslo_der",
  },
  {
    nombreIzq: "Gemelo Izq",
    campoIzq: "gemelo_izq",
    nombreDer: "Gemelo Der",
    campoDer: "gemelo_der",
  },
];

export default function Mediciones() {
  const [user, setUser] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCharts, setExpandedCharts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [formValues, setFormValues] = useState({});

  const fetchData = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perimetros")
      .select("*")
      .eq("user_id", uid)
      .order("fecha", { ascending: true });
    if (!error) {
      setHistorico(data);
    } else {
      toast.error("Error al cargar datos históricos");
    }
    setLoading(false);
  };

  useEffect(() => {
    const local = localStorage.getItem("userProfile");
    if (local) {
      const u = JSON.parse(local);
      setUser(u);
      fetchData(u.id);
    }
  }, []);

  const ultima = (campo) => {
    if (!historico.length) return null;
    const last = [...historico].reverse().find((d) => d[campo] != null);
    return last ? parseFloat(last[campo]) : null;
  };

  const toggleChart = (key) => {
    setExpandedCharts((prev) => {
      return { ...prev, [key]: !prev[key] };
    });
  };

  const openModal = (type, data) => {
    setModalType(type);
    setModalData(data);
    setFormValues({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaHoy = new Date().toISOString().split("T")[0];
    let dataToInsert = { user_id: user.id, fecha: fechaHoy };

    if (modalType === "individual") {
      if (!formValues[modalData.campo] || isNaN(formValues[modalData.campo])) {
        toast.error("Introduce un valor válido");
        return;
      }
      dataToInsert[modalData.campo] = parseFloat(formValues[modalData.campo]);
    } else if (modalType === "par") {
      if (
        !formValues[modalData.campoIzq] ||
        !formValues[modalData.campoDer] ||
        isNaN(formValues[modalData.campoIzq]) ||
        isNaN(formValues[modalData.campoDer])
      ) {
        toast.error("Introduce valores válidos en ambos lados");
        return;
      }
      dataToInsert[modalData.campoIzq] = parseFloat(
        formValues[modalData.campoIzq]
      );
      dataToInsert[modalData.campoDer] = parseFloat(
        formValues[modalData.campoDer]
      );
    }

    try {
      const { data, error } = await supabase
        .from("perimetros")
        .upsert(dataToInsert, { onConflict: ["user_id", "fecha"] })
        .select();

      if (error) throw error;

      toast.success("Medición guardada correctamente");

      setHistorico((prev) => {
        const withoutOld = prev.filter((d) => d.fecha !== fechaHoy);
        return [...withoutOld, data[0]].sort(
          (a, b) => new Date(a.fecha) - new Date(b.fecha)
        );
      });

      setShowModal(false);
      setFormValues({});
    } catch (err) {
      toast.error("Error al guardar: " + err.message);
    }
  };

  if (!user) return <p className="text-white text-center mt-20">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton label="Atrás" to="/client-dashboard" />
          <h1 className="text-3xl md:text-4xl font-bold">Mediciones</h1>
          <div className="w-20"></div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Cargando mediciones...</p>
        ) : (
          <>
            {/* Pecho */}
            <div className="mb-6">
              <RegistroPerimetro
                nombre="Pecho"
                campo="pecho"
                userId={user.id}
                datosHistoricos={historico}
                ultimaMedicion={ultima("pecho")}
                isExpanded={expandedCharts["pecho"]}
                onToggleExpand={() => toggleChart("pecho")}
                onSaved={(nuevaMedicion) => {
                  setHistorico((prev) => {
                    const withoutOld = prev.filter(
                      (d) => d.fecha !== nuevaMedicion.fecha
                    );
                    return [...withoutOld, nuevaMedicion].sort(
                      (a, b) => new Date(a.fecha) - new Date(b.fecha)
                    );
                  });
                }}
              />
            </div>

            {/* Cintura y Cadera juntos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start">
              {["cintura", "cadera"].map((campo) => {
                const nombre = campo.charAt(0).toUpperCase() + campo.slice(1);
                const ultimaMedicion = ultima(campo);

                return (
                  <RegistroPerimetro
                    key={campo}
                    nombre={nombre}
                    campo={campo}
                    userId={user.id}
                    datosHistoricos={historico}
                    ultimaMedicion={ultimaMedicion}
                    isExpanded={expandedCharts[campo]}
                    onToggleExpand={() => toggleChart(campo)}
                    onSaved={(nuevaMedicion) => {
                      setHistorico((prev) => {
                        const withoutOld = prev.filter(
                          (d) => d.fecha !== nuevaMedicion.fecha
                        );
                        return [...withoutOld, nuevaMedicion].sort(
                          (a, b) => new Date(a.fecha) - new Date(b.fecha)
                        );
                      });
                    }}
                  />
                );
              })}
            </div>

            {/* Campos Pares */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6 items-start">
              {CAMPOS_PARES.map(
                ({ nombreIzq, campoIzq, nombreDer, campoDer }) => (
                  <RegistroPerimetroPar
                    key={`${campoIzq}-${campoDer}`}
                    nombreIzq={nombreIzq}
                    campoIzq={campoIzq}
                    nombreDer={nombreDer}
                    campoDer={campoDer}
                    userId={user.id}
                    datosHistoricos={historico}
                    ultimaMedicionIzq={ultima(campoIzq)}
                    ultimaMedicionDer={ultima(campoDer)}
                    isExpanded={expandedCharts[`${campoIzq}-${campoDer}`]}
                    onToggleExpand={() =>
                      toggleChart(`${campoIzq}-${campoDer}`)
                    }
                    onSaved={(nuevaMedicion) => {
                      setHistorico((prev) => {
                        const withoutOld = prev.filter(
                          (d) => d.fecha !== nuevaMedicion.fecha
                        );
                        return [...withoutOld, nuevaMedicion].sort(
                          (a, b) => new Date(a.fecha) - new Date(b.fecha)
                        );
                      });
                    }}
                  />
                )
              )}
            </div>

            {/* Paneles ICC e IMC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ICCPanel datosHistoricos={historico} sexo={user.sexo} />
              </div>
              <div>
                <BMInfo peso={user.weight} altura={user.height / 100} />
              </div>
            </div>
          </>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 relative"
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6">
                  {modalType === "individual"
                    ? modalData.nombre
                    : modalData.nombreIzq.replace(" Izq", "")}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {modalType === "individual" ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor (cm) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formValues[modalData.campo] || ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            [modalData.campo]: e.target.value,
                          }))
                        }
                        className="w-full p-2 rounded-lg text-white bg-gray-900 border-white border-1"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {modalData.nombreIzq} (cm) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formValues[modalData.campoIzq] || ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [modalData.campoIzq]: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded-lg text-white bg-gray-900 border-white border-1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {modalData.nombreDer} (cm) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formValues[modalData.campoDer] || ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [modalData.campoDer]: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded-lg text-white bg-gray-900 border-white border-1"
                          required
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition"
                  >
                    Guardar
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
