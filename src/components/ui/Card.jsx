//eslint-disable-next-line
import { motion } from "framer-motion";

export default function Card({ title, description, icon, onClick, className }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-blue-100 hover:bg-blue-200 rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-colors duration-300 ${className}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-blue-800 mb-2">{title}</h3>
      {description && <p className="text-blue-700 text-sm">{description}</p>}
    </motion.div>
  );
}

