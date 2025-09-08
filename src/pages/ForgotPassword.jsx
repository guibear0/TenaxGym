import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // Aquí generas el link para resetear contraseña
      const resetLink = `https://tenax-gym.vercel.app/reset-password?email=${encodeURIComponent(email)}`;

      const result = await emailjs.send(
        "service_ntzqsbc",   
        "template_qadxe77",  
        {
          to_email: email,
          reset_link: resetLink,
        },
        "iZi8bO391P5WcW5I9"     // ⬅️ tu Public Key de EmailJS
      );

      console.log("EmailJS result:", result);
      setMsg("✅ Correo de recuperación enviado. Revisa tu bandeja.");
    } catch (err) {
      console.error("EmailJS error:", err);
      setMsg("❌ Error al enviar: " + err.text);
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
          Enviar correo de recuperación
        </button>
      </form>
    </div>
  );
}
