//eslint-disable-next-line
import { motion } from "framer-motion";

export default function Button({ children, onClick, variant = "solid", className }) {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 inline-flex items-center justify-center hover:cursor-pointer";
  const variants = {
    solid: "bg-blue-600 text-white border border-gray-700/50 hover:bg-blue-700 hover:border-blue-500",
    outline: "border-2 border-gray-600 text-gray-100 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 hover:text-blue-400 hover:border-blue-500",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
