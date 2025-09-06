import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": "", 
        },
        body: JSON.stringify({
          sender: {
            name: "Tenax Gym",
            email: "tenaxgym@gmail.com", // debe estar verificado en Brevo
          },
          to: [
            {
              email: email,
              name: "Usuario Tenax", // puedes meter dinámico si tienes nombre
            },
          ],
          subject: "Recupera tu contraseña - Tenax Gym",
          htmlContent: `
            <html>
              <body>
                <h2>Recuperación de contraseña</h2>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="http://localhost:5173/reset-password?email=${email}">
                  Resetear contraseña
                </a>
              </body>
            </html>
          `,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMsg("✅ Correo de recuperación enviado.");
      } else {
        setMsg("❌ Error al enviar: " + JSON.stringify(data));
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
