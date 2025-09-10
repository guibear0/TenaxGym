import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Buscar el usuario en la tabla profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", form.email)
        .single();

      if (error || !data) {
        setErrorMsg("Usuario o contraseña incorrectos");
        return;
      }

      // Verificar contraseña usando bcrypt
      const bcrypt = await import("bcryptjs");
      const match = await bcrypt.compare(form.password, data.password);
      if (!match) {
        setErrorMsg("Usuario o contraseña incorrectos");
        return;
      }

      // Guardar perfil y redirigir
      localStorage.setItem("userProfile", JSON.stringify(data));


      // Después
      if (data.is_trainer) {
        navigate("/trainer-dashboard");
      } else {
        navigate("/client-dashboard");
      }

    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="border px-4 py-2 rounded"
        />

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Iniciar Sesión
        </button>

        <p className="text-center text-gray-600 mt-2">
          <Link
            to="/forgot-password"
            className="text-blue-600 font-semibold underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-gray-600 mt-2">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
