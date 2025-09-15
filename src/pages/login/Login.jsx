import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs";
import Button from "../../components/ui/Button";

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
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center justify-center w-full">
        <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          TENAX GYM
        </Link>

        <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0 dark:bg-slate-50 dark:border dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-gray-900">
              Inicia sesión en tu cuenta
            </h1>

            {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Tu correo
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="tucorreo@correo.com"
                  className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-slate-50 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm font-medium text-gray-900 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Iniciar Sesión
              </Button>

              <p className="text-sm font-light text-gray-900 text-center">
                ¿No tienes cuenta aún?{" "}
                <Link to="/register" className="font-medium text-primary-600 hover:underline">
                  Regístrate
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
