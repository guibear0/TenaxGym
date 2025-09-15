import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Pencil, Check, X, User, Mail, Weight, Ruler, Lock, AlertCircle } from "lucide-react";
import bcrypt from "bcryptjs";
import PasswordInput from "../components/ui/PasswordInput";
import BackButton from "../components/ui/BackButton";

export default function Profile() {
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
      if (!updatedValue || updatedValue.trim() === "") {
        setErrorMsg("La contraseña no puede estar vacía.");
        return;
      }
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
      const newProfile = { ...profile, [field]: updatedValue };
      if (field === "password") newProfile.password = ""; // no guardamos hash en local
      setProfile(newProfile);
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
      setEditingField(null);
    }
  };

  const getFieldIcon = (field) => {
    const iconMap = {
      name: <User className="w-5 h-5" />,
      height: <Ruler className="w-5 h-5" />,
      weight: <Weight className="w-5 h-5" />,
      email: <Mail className="w-5 h-5" />,
      password: <Lock className="w-5 h-5" />
    };
    return iconMap[field] || <User className="w-5 h-5" />;
  };

  if (!profile) return <p className="text-center mt-20">Cargando...</p>;

  const renderField = (label, field, type = "text") => (
    <div className={`
      group relative p-4 rounded-xl border border-gray-200 
      hover:border-blue-300 hover:shadow-md transition-all duration-300
      ${editingField === field ? 'border-blue-400 shadow-lg bg-blue-50/50' : 'bg-white'}
    `}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`
          p-2 rounded-lg transition-colors duration-300
          ${editingField === field ? 'bg-blue-100 text-blue-600' : 
            'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}
        `}>
          {getFieldIcon(field)}
        </div>
        <span className="font-semibold text-gray-700">{label}</span>
      </div>

      {editingField === field ? (
        <div className="space-y-3">
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
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Ingresa tu ${label.toLowerCase()}`}
            />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(field)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white hover:shadow-md transition-all duration-200"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>
            
            <button
              onClick={() => setEditingField(null)}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-800 ml-11">
            {field === "password" ? "****" : profile[field]}
          </span>
          <button
            onClick={() => setEditingField(field)}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton label="Atrás" />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Tu Perfil</h1>
            <p className="text-gray-600 mt-1">Gestiona tu información personal</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          <div className="space-y-6">
            {renderField("Nombre", "name")}
            {renderField("Altura (cm)", "height", "number")}
            {renderField("Peso (kg)", "weight", "number")}
            {renderField("Email", "email", "email")}
            {renderField("Contraseña", "password", "password")}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Los cambios se guardan automáticamente y están protegidos con encriptación.</p>
        </div>
      </div>
    </div>
  );
}