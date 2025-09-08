import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import PasswordInput from "../components/ui/PasswordInput";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    // 1. Validar código en Supabase
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .eq("reset_token", code)
      .single();

    if (error || !user) {
      setErrorMsg("Código inválido o correo incorrecto.");
      return;
    }

    try {
      // 2. Hashear la contraseña usando bcrypt
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Actualizar contraseña y limpiar reset_token
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          password: hashedPassword,
          reset_token: null,
        })
        .eq("email", email);

      if (updateError) {
        setErrorMsg(updateError.message);
      } else {
        setInfoMsg("Contraseña actualizada correctamente. Redirigiendo...");

        // Login simulado (guardamos profile)
        localStorage.setItem("userProfile", JSON.stringify(user));

        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setErrorMsg("Error al actualizar contraseña: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 p-6">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Restablecer contraseña</h1>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {infoMsg && <p className="text-green-600">{infoMsg}</p>}

        <input
          type="email"
          placeholder="Tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border px-4 py-2 rounded"
        />

        <input
          type="text"
          placeholder="Código recibido"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          className="border px-4 py-2 rounded"
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite la contraseña"
        />

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Guardar nueva contraseña
        </button>
      </form>
    </div>
  );
}
