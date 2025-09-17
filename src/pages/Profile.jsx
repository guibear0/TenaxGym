import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Check,
  X,
  User,
  Mail,
  Weight,
  Ruler,
  Lock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import bcrypt from "bcryptjs";
import PasswordInput from "../components/ui/PasswordInput";
import BackButton from "../components/ui/BackButton";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({ type: "", message: "", visible: false });
  const navigate = useNavigate();

  

  // ---- Mostrar toast ----
  const showToast = (type, message) => {
    setToast({ type, message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 5000);
  };

  useEffect(() => {
    const user = localStorage.getItem("userProfile");
    if (!user) {
      navigate("/login");
    } else {
      setProfile(JSON.parse(user));
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const startEditing = (field) => {
    setToast({ type: "", message: "", visible: false });
    setEditingField(field);
    setConfirmPassword("");
    setTempValue(field === "password" ? "" : profile[field] || "");
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
    setConfirmPassword("");
  };

  const handleSave = async (field) => {
    if (!profile) return;

    let updatedValue = tempValue;

    // Validaciones
    if (field === "email" && !validateEmail(updatedValue)) {
      return showToast("error", "Por favor ingresa un email válido.");
    }

    if (field === "height") {
      const h = parseFloat(updatedValue);
      if (isNaN(h) || h < 50 || h > 300) {
        return showToast("error", "La altura debe estar entre 50 cm y 300 cm.");
      }
    }

    if (field === "weight") {
      const w = parseFloat(updatedValue);
      if (isNaN(w) || w < 20 || w > 500) {
        return showToast("error", "El peso debe estar entre 20 kg y 500 kg.");
      }
    }

    if (field === "password") {
      if (!updatedValue || updatedValue.trim() === "") {
        return showToast("error", "La contraseña no puede estar vacía.");
      }
      if (updatedValue !== confirmPassword) {
        return showToast("error", "Las contraseñas no coinciden.");
      }
      const salt = bcrypt.genSaltSync(10);
      updatedValue = bcrypt.hashSync(updatedValue, salt);
    }

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: updatedValue })
      .eq("id", profile.id);

    if (error) {
      showToast("error", "Error al actualizar: " + error.message);
    } else {
      const newProfile = {
        ...profile,
        [field]: field === "password" ? "" : updatedValue,
      };
      setProfile(newProfile);
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
      cancelEditing();
      showToast("success", "¡Cambios guardados correctamente!");
    }
  };

  const getFieldIcon = (field) => {
    const iconMap = {
      name: <User className="w-6 h-6" />,
      height: <Ruler className="w-6 h-6" />,
      weight: <Weight className="w-6 h-6" />,
      email: <Mail className="w-6 h-6" />,
      password: <Lock className="w-6 h-6" />,
    };
    return iconMap[field] || <User className="w-6 h-6" />;
  };

  if (!profile) return <p className="text-center mt-20 text-white">Cargando...</p>;

  const renderField = (label, field, type = "text") => (
    <motion.div
      className={`group relative p-6 rounded-2xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm hover:border-blue-500 hover:shadow-xl transition-all duration-300 ${
        editingField === field ? "border-blue-600 shadow-lg bg-blue-900/30" : ""
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-4 mb-3">
        <div
          className={`p-3 rounded-lg transition-colors duration-300 ${
            editingField === field
              ? "bg-blue-900 text-blue-400"
              : "bg-gray-700 text-gray-300 group-hover:bg-blue-900 group-hover:text-blue-400"
          }`}
        >
          {getFieldIcon(field)}
        </div>
        <span className="font-semibold text-gray-100 text-lg">{label}</span>
      </div>

      {editingField === field ? (
        <div className="space-y-4">
          {field === "password" ? (
            <>
              <PasswordInput
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </>
          ) : (
            <input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full border border-gray-600 px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Ingresa tu ${label.toLowerCase()}`}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleSave(field)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white hover:shadow-md transition-all duration-200"
              aria-label={`Guardar cambios para ${label}`}
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>

            <button
              onClick={cancelEditing}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              aria-label="Cancelar edición"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-200 ml-12">
            {field === "password" ? "****" : profile[field] || "No establecido"}
          </span>
          <button
            onClick={() => startEditing(field)}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-900/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={`Editar ${label}`}
          >
            <Pencil className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {profile.name ? `${profile.name}!` : "!"} Este es tu perfil!
            </h1>
          </div>
          <div className="w-20"></div>
        </div>

        {/* TOAST */}
        <AnimatePresence>
          {toast.visible && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === "error"
                  ? "bg-red-900/80 border border-red-700 text-red-200"
                  : "bg-green-900/80 border border-green-700 text-green-200"
              } backdrop-blur-sm`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <BackButton label="Atrás" className=" " />

        {/* Profile Card */}
        <motion.div
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8 mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          
          <div className="space-y-6">
            {renderField("Nombre", "name")}
            {renderField("Altura (cm)", "height", "number")}
            {renderField("Peso (kg)", "weight", "number")}
            {renderField("Email", "email", "email")}
            {renderField("Contraseña", "password", "password")}
          </div>
        </motion.div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Los cambios se guardan automáticamente y están protegidos con
            encriptación.
          </p>
        </div>
      </div>
    </div>
  );
}