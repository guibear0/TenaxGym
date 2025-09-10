//eslint-disable-next-line
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Volver" }) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(-1)} // <- vuelve a la página anterior
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 
                 text-gray-700 bg-white/80 backdrop-blur-sm hover:border-blue-600 
                 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
    >
      <ArrowLeft size={20} />
      <span className="font-semibold">{label}</span>
    </motion.button>
  );
}
