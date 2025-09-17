//eslint-disable-next-line
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", form.email)
        .single();

      if (error || !data) {
        setErrorMsg("Usuario o contraseña incorrectos");
        return;
      }

      const match = await bcrypt.compare(form.password, data.password);
      if (!match) {
        setErrorMsg("Usuario o contraseña incorrectos");
        return;
      }

      localStorage.setItem("userProfile", JSON.stringify(data));

      navigate(data.is_trainer ? "/trainer-dashboard" : "/client-dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center w-full max-w-md"
      >
        <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-100 hover:text-blue-400 transition-all duration-200">
          TENAX GYM
        </Link>

        <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 sm:p-8 space-y-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-100">
            Inicia sesión en tu cuenta
          </h1>

          {errorMsg && <p className="text-red-400 text-sm font-medium">{errorMsg}</p>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-100">
                Tu correo
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="tucorreo@correo.com"
                className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
                aria-label="Email address"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-100">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
                aria-label="Password"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-all duration-200">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white rounded-lg border border-gray-700/50 hover:bg-blue-700 hover:border-blue-500 transition-all duration-200 p-2.5 font-semibold cursor-pointer"
              aria-label="Sign in"
            >
              Iniciar Sesión
            </motion.button>

            <p className="text-sm font-light text-gray-100 text-center">
              ¿No tienes cuenta aún?{" "}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-all duration-200">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </section>
  );
}