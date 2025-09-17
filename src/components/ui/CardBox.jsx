//eslint-disable-next-line
import { motion } from "framer-motion";

export default function CardBox({ title, icon, description, onClick, bgColor, hoverColor }) {
  const cardVariants = {
    hover: { scale: 1.05, rotate: 2, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" },
    rest: { scale: 1, rotate: 0, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl p-6 cursor-pointer text-white ${bgColor} ${hoverColor} transition-colors duration-300 relative overflow-hidden`}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      aria-label={`Navigate to ${title}`}
    >
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
      
      {/* Icon */}
      <div className="relative z-10">{icon}</div>
      
      {/* Title */}
      <h2 className="mt-4 text-2xl font-bold relative z-10">{title}</h2>
      
      {/* Description */}
      <p className="mt-2 text-sm text-gray-200 text-center relative z-10">{description}</p>
    </motion.div>
  );
}