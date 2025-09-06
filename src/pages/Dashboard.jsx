import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Pencil, LogOut } from "lucide-react";
import bcrypt from "bcryptjs";
import PasswordInput from "../components/ui/PasswordInput";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("userProfile");
    if (!user) {
      navigate("/login");
    } else {
      setProfile(JSON.parse(user));
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async (field) => {
    if (!profile) return;
    setErrorMsg("");

    let updatedValue = profile[field];

    if (field === "email" && !validateEmail(updatedValue)) {
      setErrorMsg("Por favor ingresa un email válido.");
      return;
    }

    if (field === "height") {
      const h = parseFloat(updatedValue);
      if (isNaN(h) || h < 50 || h > 300) {
        setErrorMsg("La altura debe estar entre 50 cm y 300 cm.");
        return;
      }
    }

    if (field === "weight") {
      const w = parseFloat(updatedValue);
      if (isNaN(w) || w < 20 || w > 500) {
        setErrorMsg("El peso debe estar entre 20 kg y 500 kg.");
        return;
      }
    }

    if (field === "password") {
      const salt = bcrypt.genSaltSync(10);
      updatedValue = bcrypt.hashSync(updatedValue, salt);
    }

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: updatedValue })
      .eq("id", profile.id);

    if (error) {
      setErrorMsg("Error al actualizar: " + error.message);
    } else {
      // Actualizamos el profile en memoria
      const newProfile = { ...profile, [field]: updatedValue };

      // 🔥 Si la field era password, limpiamos el campo para no mostrar el hash
      if (field === "password") {
        newProfile.password = "";
      }

      setProfile(newProfile);
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
      setEditingField(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  if (!profile) return <p className="text-center mt-20">Cargando...</p>;

  const renderField = (label, field, type = "text") => (
    <div className="flex items-center justify-between gap-2">
      <span className="font-semibold">{label}:</span>
      {editingField === field ? (
        <>
          {field === "password" ? (
            <PasswordInput
              value={profile[field] || ""}
              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              placeholder="Nueva contraseña"
            />
          ) : (
            <input
              type={type}
              value={profile[field] || ""}
              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
              className="border px-2 py-1 rounded flex-1"
            />
          )}
          <button
            onClick={() => handleSave(field)}
            className="text-green-600 font-bold"
          >
            Guardar
          </button>
        </>
      ) : (
        <>
          <span>{field === "password" ? "****" : profile[field]}</span>
          <button onClick={() => setEditingField(field)}>
            <Pencil className="w-5 h-5 text-gray-500" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-8 gap-6 bg-gray-50">
      <div className="flex justify-between w-full max-w-md items-center">
        <h1 className="text-2xl font-bold">Tu Perfil</h1>
        <button onClick={handleLogout} className="bg-blue-600 p-2 rounded-full">
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4">
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {renderField("Nombre", "name")}
        {renderField("Altura (cm)", "height", "number")}
        {renderField("Peso (kg)", "weight", "number")}
        {renderField("Email", "email", "email")}
        {renderField("Contraseña", "password", "password")}
      </div>
    </div>
  );
}
