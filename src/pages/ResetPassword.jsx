import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/ui/PasswordInput";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (password !== confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setInfoMsg("Contraseña actualizada correctamente. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
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
