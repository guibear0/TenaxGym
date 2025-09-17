import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import PasswordInput from "../../components/ui/PasswordInput";

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
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

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

        localStorage.setItem("userProfile", JSON.stringify(user));

        const redirectPath = user.is_trainer ? "/trainer-dashboard" : "/client-dashboard";
        setTimeout(() => navigate(redirectPath), 2000);
      }
    } catch (err) {
      setErrorMsg("Error al actualizar contraseña: " + err.message);
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
          onSubmit={handleReset}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 sm:p-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-center text-gray-100">
            Restablecer contraseña
          </h1>
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-red-400 text-sm font-medium text-center"
              >
                {errorMsg}
              </motion.p>
            )}
            {infoMsg && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-green-400 text-sm font-medium text-center"
              >
                {infoMsg}
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
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-100">
              Código recibido
            </label>
            <input
              type="text"
              placeholder="Código recibido"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
              aria-label="Reset code"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-100">
              Nueva contraseña
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              required
              className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
              aria-label="New password"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-100">
              Repite la contraseña
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
              className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
              aria-label="Confirm password"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white rounded-lg border border-gray-700/50 hover:bg-blue-700 hover:border-blue-500 transition-all duration-200 p-2.5 font-semibold"
            aria-label="Save new password"
          >
            Guardar nueva contraseña
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
}