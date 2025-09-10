//eslint-disable-next-line
import { motion } from "framer-motion";
import { HeartHandshake } from 'lucide-react'
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-alice-blue min-h-screen flex flex-col justify-center top-15">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
       className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-100"

      >
        <HeartHandshake className="w-6 h-6 text-blue-600" />
        <span className="text-2xl font-bold text-blue-800">TENAX GYM</span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
        >
          Transforma tu
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block">
            Fitness Journey
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl lg:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Registra ejercicios, monitorea tu peso y medidas, organiza tu rutina con nuestro calendario inteligente
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
          >
            Comenzar Gratis
          </button>
          <button
            onClick={() => navigate("/login")}
            className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full text-lg font-semibold text-gray-800 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 cursor-pointer w-full sm:w-auto"
          >
            Iniciar Sesión
          </button>
        </motion.div>
      </div>
    </section>
  );
}

