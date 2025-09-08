import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabase";

function generateResetCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // 1. Generar código
      const resetCode = generateResetCode();

      // 2. Guardar en Supabase en el usuario
      const { error } = await supabase
        .from("profiles")
        .update({ reset_token: resetCode })
        .eq("email", email);

      if (error) {
        setMsg("❌ Error guardando código en BD: " + error.message);
        return;
      }

      // 3. Enviar correo con el código
      await emailjs.send(
        "service_ntzqsbc",
        "template_qadxe77",
        {
          email: email,
          reset_code: resetCode,
        },
        "iZi8bO391P5WcW5I9"
      );

      setMsg("✅ Código de recuperación enviado a tu correo. Redirigiendo...");

      // 4. Esperar 3.5 segundos y redirigir a reset password con correo
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 3500);

    } catch (err) {
      setMsg("❌ Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleRecover}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Recuperar contraseña</h1>
        {msg && <p className="text-red-500">{msg}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border px-4 py-2 rounded"
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Enviar código
        </button>
      </form>
    </div>
  );
}
