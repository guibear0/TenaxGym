import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { supabase } from "../../lib/supabase";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";

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
      const { data: user, error: checkError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (checkError || !user) {
        setMsg("❌ El correo electrónico no está registrado en nuestro sistema.");
        return;
      }

      const resetCode = generateResetCode();

      const { error } = await supabase
        .from("profiles")
        .update({ reset_token: resetCode })
        .eq("email", email);

      if (error) {
        setMsg("❌ Error guardando código en BD: " + error.message);
        return;
      }

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

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 3500);
    } catch (err) {
      setMsg("❌ Error: " + err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleRecover}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 sm:p-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-center text-gray-100">
            Recuperar contraseña
          </h1>
          <AnimatePresence>
            {msg && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`${msg.includes("✅") ? "text-green-400" : "text-red-400"} text-sm font-medium text-center`}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-100">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
              aria-label="Email address"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white rounded-lg border border-gray-700/50 hover:bg-blue-700 hover:border-blue-500 transition-all duration-200 p-2.5 font-semibold"
            aria-label="Send recovery code"
          >
            Enviar código
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}