import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email) {
      setMsg("❌ Por favor ingresa un correo válido.");
      return;
    }

    try {
      const resetLink = `https://tenax-gym.vercel.app/reset-password?email=${encodeURIComponent(email)}`;

      const result = await emailjs.send(
        "service_ntzqsbc",    // tu Service ID
        "template_qadxe77",   // tu Template ID
        {
          email: email,  // debe coincidir con la variable de la plantilla
          reset_link: resetLink,
        },
        "iZi8bO391P5WcW5I9"  // tu Public Key
      );

      console.log("EmailJS result:", result);
      setMsg("✅ Correo de recuperación enviado. Revisa tu bandeja.");
    } catch (err) {
      console.error("EmailJS error:", err);
      setMsg("❌ Error al enviar. Revisa la consola para más detalles.");
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
