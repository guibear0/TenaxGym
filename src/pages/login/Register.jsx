import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    is_trainer: false,
    trainerCode: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (form.is_trainer) {
        const code = (form.trainerCode || "").trim().toUpperCase();
        if (code !== "TENAXTRAINER") {
          setErrorMsg("Código de entrenador incorrecto");
          return;
        }
      }

      const hashedPassword = await bcrypt.hash(form.password, 10);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          name: form.name,
          email: form.email,
          password: hashedPassword,
          is_trainer: form.is_trainer,
        })
        .select();

      if (error) throw error;

      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          id: data[0].id,
          name: form.name,
          email: form.email,
          is_trainer: form.is_trainer,
        })
      );

      navigate(form.is_trainer ? "/trainer-dashboard" : "/client-dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Error al registrar");
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
            Crear cuenta
          </h1>

          {errorMsg && <p className="text-red-400 text-sm font-medium">{errorMsg}</p>}

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-100">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
                aria-label="Full name"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-100">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tucorreo@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
                aria-label="Password"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center"
            >
              <input
                id="trainer"
                type="checkbox"
                checked={form.is_trainer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_trainer: e.target.checked,
                    trainerCode: e.target.checked ? form.trainerCode : "",
                  })
                }
                className="w-4 h-4 border border-gray-600 rounded bg-gray-900 focus:ring-3 focus:ring-blue-500 text-blue-500 cursor-pointer"
                aria-label="Register as trainer"
              />
              <label
                htmlFor="trainer"
                className="ml-2 block text-sm font-semibold text-gray-100"
              >
                Soy entrenador
              </label>
            </motion.div>

            <AnimatePresence>
              {form.is_trainer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="block mb-2 text-sm font-semibold text-gray-100">
                    Código de entrenador
                  </label>
                  <input
                    type="text"
                    placeholder="Introduce el código"
                    value={form.trainerCode}
                    onChange={(e) => setForm({ ...form, trainerCode: e.target.value })}
                    required={form.is_trainer}
                    className="bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200"
                    aria-label="Trainer code"
                  />
                  <p className="text-sm text-gray-300 mt-1">
                    Introduce el código secreto para entrenadores
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white rounded-lg border border-gray-700/50 hover:bg-blue-700 hover:border-blue-500 transition-all duration-200 p-2.5 font-semibold"
              aria-label="Register"
            >
              Regístrate
            </motion.button>

            <p className="text-sm font-light text-gray-100 text-center">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-all duration-200">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </section>
  );
}