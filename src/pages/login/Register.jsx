import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";
 // eslint-disable-next-line 
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/ui/Button";

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
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center justify-center w-full">
        <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          TENAX GYM
        </Link>

        <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0 dark:bg-slate-50 dark:border dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Crear cuenta
            </h1>

            {errorMsg && <p className="text-red-500">{errorMsg}</p>}

            <form className="space-y-4 md:space-y-6" onSubmit={handleRegister}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@correo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              {/* Checkbox con animación */}
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
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 cursor-pointer"
                />
                <label
                  htmlFor="trainer"
                  className="ml-2 block text-sm font-medium text-gray-900 "
                >
                  Soy entrenador
                </label>
              </motion.div>

              {/* Código de entrenador animado con salida */}
              <AnimatePresence>
                {form.is_trainer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Código de entrenador
                    </label>
                    <input
                      type="text"
                      placeholder="Introduce el código"
                      value={form.trainerCode}
                      onChange={(e) => setForm({ ...form, trainerCode: e.target.value })}
                      required={form.is_trainer}
                      className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-900  mt-1">
                      Introduce el código secreto para entrenadores
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Regístrate
              </Button>

              <p className="text-sm font-light text-gray-900  text-center">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
