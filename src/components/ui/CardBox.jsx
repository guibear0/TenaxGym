import { motion } from "framer-motion";

export default function CardBox({
  title,
  icon,
  description,
  bgColor,
  hoverColor,
  onClick,
}) {
  const cardVariants = {
    rest: {
      scale: 1,
      boxShadow: `0 4px 10px 0 rgba(0,0,0,0.3)`,
    },
    hover: {
      scale: 1.05,
      boxShadow: `0 0 20px 3px ${hoverColor}80, 0 10px 25px rgba(0,0,0,0.3)`,
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      onClick={onClick}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      aria-label={`Navigate to ${title}`}
      className="relative flex flex-col items-center justify-center rounded-3xl p-6 cursor-pointer text-white overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}CC)`, // fondo oscuro con degradado sutil
        border: `2px solid ${hoverColor}`, // borde eléctrico
      }}
    >
      {/* Glow sutil */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${hoverColor}40, transparent 70%)`,
          filter: "blur(20px)",
        }}
        initial={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.1 }}
      />

      {/* Icon */}
      <div className="relative z-10">{icon}</div>

      {/* Title */}
      <h2 className="mt-4 text-2xl font-extrabold relative z-10 text-center">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-300 text-center relative z-10">
        {description}
      </p>
    </motion.div>
  );
}
