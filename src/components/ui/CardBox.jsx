//eslint-disable-next-line
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function CardBox({
  title,
  icon,
  description,
  bgColor,
  hoverColor,
  onClick,
}) {
  const controls = useAnimation();

  useEffect(() => {
    // Animación de parpadeo suave del glow
    controls.start({
      opacity: [0.5, 0.8, 0.6, 0.9, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    });
  }, [controls]);

  const cardVariants = {
    rest: {
      scale: 1,
      boxShadow: `0 4px 15px 0 rgba(0,0,0,0.3)`,
    },
    hover: {
      scale: 1.05,
      boxShadow: `
        0 0 15px 4px ${hoverColor}AA,
        0 0 25px 10px ${hoverColor}77,
        0 0 35px 15px ${hoverColor}55,
        0 10px 25px rgba(0,0,0,0.3)
      `,
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
        background: `linear-gradient(135deg, ${bgColor}CC, ${bgColor}99)`,
        border: `2px solid ${hoverColor}`,
      }}
    >
      {/* Glow animado */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at top left, ${hoverColor}50, transparent 60%),
            radial-gradient(circle at bottom right, ${hoverColor}30, transparent 70%)
          `,
          filter: "blur(50px)",
        }}
        animate={controls}
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
