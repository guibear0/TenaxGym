import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("Enviando...");

    try {
      const res = await fetch("/api/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ Correo de recuperación enviado.");
      } else {
        setMsg("❌ Error al enviar: " + (data.error || "Inténtalo más tarde."));
      }
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
          Enviar correo de recuperación
        </button>
      </form>
    </div>
  );
}
