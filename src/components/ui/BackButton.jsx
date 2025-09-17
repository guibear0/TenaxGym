//eslint-disable-next-line
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(-1)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm text-gray-100 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="font-semibold">{label}</span>
    </motion.button>
  );
}