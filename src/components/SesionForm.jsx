import { useState } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";

export default function SesionForm({
  onSubmit,
  initialData = { nombre: "", descripcion: "" },
}) {
  const [nombre, setNombre] = useState(initialData.nombre);
  const [descripcion, setDescripcion] = useState(initialData.descripcion);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSubmit(nombre, descripcion);
    setNombre("");
    setDescripcion("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 bg-gray-800/80 rounded-2xl border border-gray-700/50 space-y-4"
    >
      <input
        type="text"
        placeholder="Nombre de la sesión"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
      />
      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
        rows={3}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Guardar Sesión
      </button>
    </motion.form>
  );
}
