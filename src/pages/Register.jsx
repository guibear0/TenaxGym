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
    is_trainer: false,
    trainerCode: "", // campo para el código del entrenador
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Si el usuario marca que es entrenador, validar el código
      if (form.is_trainer) {
        const code = (form.trainerCode || "").trim().toUpperCase();
        if (code !== "TENAXTRAINER") {
          setErrorMsg("Código de entrenador incorrecto");
          return;
        }
      }

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
          is_trainer: form.is_trainer,
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
          is_trainer: form.is_trainer,
        })
      );

      if (data.is_trainer) {
        navigate("/trainer-dashboard");
      } else {
        navigate("/client-dashboard");
      }

    } catch (err) {
      // Supabase error o cualquier otro
      setErrorMsg(err.message || "Error al registrar");
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

        {/* Checkbox para marcar si es entrenador */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_trainer}
            onChange={(e) =>
              setForm({
                ...form,
                is_trainer: e.target.checked,
                // si desactiva el checkbox, limpiamos el código
                trainerCode: e.target.checked ? form.trainerCode : "",
              })
            }
            className="w-4 h-4"
          />
          <span className="text-gray-700">Soy entrenador</span>
        </label>

        {/* Input del código de entrenador — solo aparece si is_trainer = true */}
        {form.is_trainer && (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Introduce el código de entrenador"
              value={form.trainerCode}
              onChange={(e) =>
                setForm({ ...form, trainerCode: e.target.value })
              }
              required={form.is_trainer}
              className="border px-4 py-2 rounded"
              aria-label="Código de entrenador"
            />
            <p className="text-sm text-gray-500">
              Introduce el código proporcionado por TENAX (ej: <span className="font-semibold">TENAXTRAINER</span>).
            </p>
          </div>
        )}

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
