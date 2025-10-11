/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { Trash2, PlusCircle, Edit3 } from "lucide-react";
import BackButton from "../../../components/ui/BackButton";
import { toast } from "react-hot-toast";

export default function CatalogManager() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: "",
    tipo: "CALENTAMIENTO",
    descripcion: "",
    imagen: "",
  });
  const [editingExercise, setEditingExercise] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    CALENTAMIENTO: false,
    BLOQUE_FUERZA: false,
    ESTABILIDAD_CARDIO: false,
    CARDIO: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const catalogTitleRef = useRef(null);
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userName = userProfile?.name || "";

  const headerRef = useRef(null);

  const typeDisplayMapping = {
    CALENTAMIENTO: "Calentamiento",
    BLOQUE_FUERZA: "Fuerza",
    ESTABILIDAD_CARDIO: "Estabilidad",
    CARDIO: "Cardio",
  };

  const tipoOrder = [
    "CALENTAMIENTO",
    "BLOQUE_FUERZA",
    "ESTABILIDAD_CARDIO",
    "CARDIO",
  ];

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("catalogo_ejercicios")
          .select("id, nombre, tipo, descripcion, imagen")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setCatalog(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const groupedCatalog = tipoOrder.map((tipo) => ({
    tipo,
    displayName: typeDisplayMapping[tipo],
    items: catalog.filter((item) => item.tipo === tipo),
  }));

  const toggleSection = (tipo) => {
    setExpandedSections((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredCatalog = catalog.filter((item) =>
    normalize(item.nombre).includes(normalize(searchTerm))
  );

  const addExercise = async () => {
    if (!formValues.nombre || !formValues.tipo) {
      toast.dismiss();
      toast.error("El nombre y el tipo son obligatorios");
      return;
    }
    try {
      const { error } = await supabase
        .from("catalogo_ejercicios")
        .insert([formValues]);
      if (error) throw error;
      setFormValues({
        nombre: "",
        tipo: "CALENTAMIENTO",
        descripcion: "",
        imagen: "",
      });
      setShowAddForm(false);

      const { data } = await supabase
        .from("catalogo_ejercicios")
        .select("id, nombre, tipo, descripcion, imagen")
        .order("created_at", { ascending: true });
      setCatalog(data || []);
      toast.dismiss();
      toast.success("Ejercicio guardado correctamente");
    } catch (err) {
      toast.dismiss();
      toast.error("Error al guardar ejercicio: " + err.message);
    }
  };

  const updateExercise = async () => {
    if (!editingExercise) return;
    try {
      const { error } = await supabase
        .from("catalogo_ejercicios")
        .update(formValues)
        .eq("id", editingExercise.id);
      if (error) throw error;

      setCatalog((prev) =>
        prev.map((item) =>
          item.id === editingExercise.id ? { ...item, ...formValues } : item
        )
      );
      setEditingExercise(null);
      setFormValues({
        nombre: "",
        tipo: "CALENTAMIENTO",
        descripcion: "",
        imagen: "",
      });
      toast.dismiss();
      toast.success("Ejercicio actualizado correctamente");
    } catch (err) {
      toast.dismiss();
      toast.error("Error al actualizar ejercicio: " + err.message);
    }
  };

  const deleteExercise = (id, nombre) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>¿Eliminar {nombre}?</span>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from("catalogo_ejercicios")
                  .delete()
                  .eq("id", id);
                if (error) throw error;
                setCatalog((prev) => prev.filter((item) => item.id !== id));
                toast.success("Ejercicio eliminado correctamente");
              } catch (err) {
                toast.error("Error eliminando: " + err.message);
              }
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium"
          >
            Confirmar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm"
          >
            Cancelar
          </button>
        </div>
      ),
      { duration: Infinity }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BackButton label="Atrás" to="/trainer-dashboard" className="mb-6" />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">
          {userName ? `Hola, ${userName}!` : "Hola!"} Organiza tu catálogo
        </h1>

        <div
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 md:p-8"
          ref={catalogTitleRef}
        >
          {/* Buscador */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Header añadir */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1
              className="text-3xl md:text-4xl font-extrabold mb-6 text-center"
              ref={catalogTitleRef}
            >
              Gestiona los ejercicios del catálogo
            </h1>
            <motion.button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingExercise(null);
                // Hacer scroll al título después de abrir el formulario
                setTimeout(() => {
                  catalogTitleRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 100);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              {showAddForm ? "Cerrar" : "Añadir ejercicio"}
            </motion.button>
          </div>

          {/* Formulario */}
          <AnimatePresence>
            {(showAddForm || editingExercise) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mb-6 p-4 bg-gray-900/80 rounded-2xl border border-gray-700/50"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {editingExercise
                    ? "Editar ejercicio"
                    : "Añadir nuevo ejercicio"}
                </h2>
                <div className="space-y-3">
                  <input
                    name="nombre"
                    placeholder="Nombre del ejercicio"
                    value={formValues.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
                  />
                  <select
                    name="tipo"
                    value={formValues.tipo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
                  >
                    {tipoOrder.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {typeDisplayMapping[tipo]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción (opcional)"
                    value={formValues.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
                  />
                  <input
                    name="imagen"
                    placeholder="URL de imagen (opcional)"
                    value={formValues.imagen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600"
                  />
                  <div className="flex gap-3">
                    <motion.button
                      onClick={editingExercise ? updateExercise : addExercise}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer"
                    >
                      {editingExercise ? "Actualizar" : "Guardar"}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingExercise(null);
                        setFormValues({
                          nombre: "",
                          tipo: "CALENTAMIENTO",
                          descripcion: "",
                          imagen: "",
                        });
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Catálogo */}
          {loading ? (
            <p className="text-center text-gray-300 py-8">
              Cargando catálogo...
            </p>
          ) : error ? (
            <p className="text-center text-red-400 py-8">{error}</p>
          ) : searchTerm ? (
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Resultados de búsqueda
              </h4>
              {filteredCatalog.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCatalog.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="relative bg-gray-900 rounded-2xl p-4 border border-gray-700/50 overflow-hidden"
                    >
                      <div className="relative z-10 flex justify-between items-start">
                        <div className="pr-2">
                          <p className="font-semibold text-gray-100">
                            {item.nombre}
                          </p>
                          <p className="text-sm text-gray-400">
                            {typeDisplayMapping[item.tipo]}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingExercise(item);
                              setFormValues({
                                nombre: item.nombre || "",
                                tipo: item.tipo || "CALENTAMIENTO",
                                descripcion: item.descripcion || "",
                                imagen: item.imagen || "",
                              });
                              setShowAddForm(true);
                              setTimeout(() => {
                                catalogTitleRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }, 100);
                            }}
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteExercise(item.id, item.nombre)}
                            className="text-red-600 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {item.descripcion && (
                        <p className="mt-3 text-gray-300 text-sm">
                          {item.descripcion}
                        </p>
                      )}
                      {item.imagen && (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="mt-3 w-full h-36 object-cover rounded-lg"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">
                  No se encontraron ejercicios.
                </p>
              )}
            </div>
          ) : (
            groupedCatalog.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.tipo} className="mb-5">
                    <div
                      className="flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
                      onClick={() => toggleSection(group.tipo)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={!!expandedSections[group.tipo]}
                      aria-label={`Toggle ${group.displayName} section`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          toggleSection(group.tipo);
                      }}
                    >
                      <h3 className="font-semibold text-lg text-gray-100">
                        {group.displayName}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                          transform: expandedSections[group.tipo]
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                    <AnimatePresence>
                      {expandedSections[group.tipo] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
                        >
                          {group.items.map((item) => (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.01 }}
                              className="relative bg-gray-900 rounded-2xl p-4 border border-gray-700/50 overflow-hidden"
                            >
                              <div className="relative z-10 flex justify-between items-start">
                                <div className="pr-2">
                                  <p className="font-semibold text-gray-100">
                                    {item.nombre}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {typeDisplayMapping[item.tipo]}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      setEditingExercise(item);
                                      setFormValues({
                                        nombre: item.nombre || "",
                                        tipo: item.tipo || "CALENTAMIENTO",
                                        descripcion: item.descripcion || "",
                                        imagen: item.imagen || "",
                                      });
                                      setShowAddForm(true);
                                      setTimeout(() => {
                                        catalogTitleRef.current?.scrollIntoView(
                                          {
                                            behavior: "smooth",
                                          }
                                        );
                                      }, 100);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                                  >
                                    <Edit3 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteExercise(item.id, item.nombre)
                                    }
                                    className="text-red-600 hover:text-red-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              {item.descripcion && (
                                <p className="mt-3 text-gray-300 text-sm">
                                  {item.descripcion}
                                </p>
                              )}
                              {item.imagen && (
                                <img
                                  src={item.imagen}
                                  alt={item.nombre}
                                  className="mt-3 w-full h-36 object-cover rounded-lg"
                                />
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
            )
          )}
        </div>
      </div>
    </div>
  );
}
