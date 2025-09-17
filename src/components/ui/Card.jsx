//eslint-disable-next-line
import { motion } from "framer-motion";

export default function Card({ title, description, icon, onClick, className }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 flex flex-col items-center text-center ${className}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
      {description && <p className="text-gray-300 text-sm">{description}</p>}
    </motion.div>
  );
}

