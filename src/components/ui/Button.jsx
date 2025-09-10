//eslint-disable-next-line
import { motion } from "framer-motion";

export default function Button({ children, onClick, variant = "solid", className }) {
  const baseStyle = "px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 inline-flex items-center justify-center hover:cursor-pointer";
  const variants = {
    solid: "bg-green-500 text-white hover:bg-green-600",
    outline: "border-2 border-green-500 text-green-500 hover:bg-green-50",
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
