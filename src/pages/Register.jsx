import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import bcrypt from "bcryptjs"; 

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    height: "",
    weight: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(form.password, 10);

      // Insertamos el usuario en la tabla profiles
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          name: form.name,
          height: form.height,
          weight: form.weight,
          email: form.email,
          password: hashedPassword,
        })
        .select();

      if (error) throw error;

      // Guardamos el perfil en localStorage para simular sesión
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          id: data[0].id,
          name: form.name,
          height: form.height,
          weight: form.weight,
          email: form.email,
        })
      );

      // Redirigimos al dashboard
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}

        <input
          type="text"
          placeholder="Nombre completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Altura (cm)"
          value={form.height}
          onChange={(e) => setForm({ ...form, height: e.target.value })}
          required
          className="border px-4 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Peso (kg)"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          required
          className="border px-4 py-2 rounded"
        />
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
          Registrarse
        </button>

        <p className="text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
