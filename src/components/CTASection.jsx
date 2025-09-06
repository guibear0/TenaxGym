import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
      <p className="mb-6">
        Regístrate gratis y comienza a llevar tu progreso al siguiente nivel.
      </p>
      <Link
        to="/register"
        className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition"
      >
        Crear cuenta
      </Link>
    </section>
  );
}
