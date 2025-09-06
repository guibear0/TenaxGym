import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Bienvenido a <span className="text-yellow-300">TENAX GYM</span>
      </h1>
      <p className="text-lg md:text-xl mb-6 max-w-2xl">
        Tu plataforma para gestionar entrenamientos, progreso y alcanzar tus
        objetivos de fitness con tu entrenador personal.
      </p>
      <Link
        to="/register"
        className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition"
      >
        ¡Comienza ahora!
      </Link>
    </section>
  );
}
