//eslint-disable-next-line
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden  flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-700/50 mt-4"
      >
        <HeartHandshake className="w-6 h-6 text-blue-400" />
        {/* 👇 Ajustamos tamaños según el viewport */}
        <span className="text-lg xs:text-xl sm:text-2xl md:text-2xl font-bold text-gray-100">
          TENAX GYM
        </span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl lg:text-5xl font-extrabold text-gray-100 mb-6 leading-tight"
        >
          Transforma tu
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent block">
            Rutina de Ejercicio
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl lg:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Registra ejercicios, monitorea tu peso y medidas, organiza tu rutina con nuestro calendario inteligente
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button
            onClick={() => navigate("/register")}
            variant="solid"
            className="w-full sm:w-auto px-8 py-4 text-lg"
            aria-label="Start for free"
          >
            Comenzar Gratis
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full sm:w-auto px-8 py-4 text-lg"
            aria-label="Sign in"
          >
            Iniciar Sesión
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
