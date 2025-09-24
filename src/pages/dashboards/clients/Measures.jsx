import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import RegistroPerimetro from "../../../components/RegistroPerimetro";
import RegistroPerimetroPar from "../../../components/RegistroPerimetroPar";
import ICCPanel from "../../../components/ICCInfo";
import BMInfo from "../../../components/IMCPanel";

const CAMPOS_INDIVIDUALES = [
  { nombre: "Pecho", campo: "pecho" },
  { nombre: "Cintura", campo: "cintura" },
  { nombre: "Cadera", campo: "cadera" },
];

const CAMPOS_PARES = [
  { nombreIzq: "Bíceps Izq", campoIzq: "biceps_izq", nombreDer: "Bíceps Der", campoDer: "biceps_der" },
  { nombreIzq: "Bíceps Contraído Izq", campoIzq: "biceps_contraido_izq", nombreDer: "Bíceps Contraído Der", campoDer: "biceps_contraido_der" },
  { nombreIzq: "Muslo Izq", campoIzq: "muslo_izq", nombreDer: "Muslo Der", campoDer: "muslo_der" },
  { nombreIzq: "Gemelo Izq", campoIzq: "gemelo_izq", nombreDer: "Gemelo Der", campoDer: "gemelo_der" },
];

export default function Mediciones() {
  const [user, setUser] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perimetros")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    if (!error) setHistorico(data);
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

  if (!user) return <p className="text-white text-center mt-20">Cargando...</p>;

  // Última medición de un campo
  const ultima = (campo) => {
    if (!historico.length) return null;
    const last = [...historico].reverse().find((d) => d[campo] != null);
    return last ? last[campo] : null;
  };

  // Actualiza el histórico localmente al añadir un valor
  const handleSaved = (nuevaFila) => {
    setHistorico((prev) => [...prev, nuevaFila]);
  };

  // Tomar peso y altura del perfil del usuario
  const pesoUsuario = user?.weight ?? null;
  // height está en cm -> lo pasamos a metros
  const alturaUsuario = user?.height ? user.height / 100 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          {user.name}, gestiona tus mediciones
        </h1>

        {loading ? (
          <p className="text-center text-gray-400">Cargando mediciones...</p>
        ) : (
          <>
            {/* Campos individuales */}
            {CAMPOS_INDIVIDUALES.map(({ nombre, campo }) => (
              <RegistroPerimetro
                key={campo}
                nombre={nombre}
                campo={campo}
                userId={user.id}
                datosHistoricos={historico}
                ultimaMedicion={ultima(campo)}
                onSaved={handleSaved}
              />
            ))}

            {/* Campos pares */}
            {CAMPOS_PARES.map(({ nombreIzq, campoIzq, nombreDer, campoDer }) => (
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
                onSaved={handleSaved}
              />
            ))}

            {/* Paneles ICC e IMC lado a lado */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-stretch">
              <div className="flex-1 max-w-md h-full">
                <ICCPanel datosHistoricos={historico} sexo={user.sexo} />
              </div>
              <div className="flex-1 max-w-md h-full">
                <BMInfo
                  peso={pesoUsuario}
                  altura={alturaUsuario}
                  className="bg-gray-800/80 rounded-xl border border-gray-700/50 shadow text-center h-full"
                />
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}