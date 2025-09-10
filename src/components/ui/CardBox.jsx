//eslint-disable-next-line
import { motion } from "framer-motion";

export default function CardBox({ title, icon, onClick }) {
  const cardVariants = {
    hover: { scale: 1.05 },
    rest: { scale: 1 },
  };

  return (
    <motion.div
      onClick={onClick}
      className="flex flex-col items-center justify-center text-white rounded-xl shadow-lg p-8 cursor-pointer bg-blue-500 hover:bg-blue-600"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon}
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
    </motion.div>
  );
}
