//eslint-disable-next-line
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20  text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-gray-100 mb-6"
      >
        ¿Listo para comenzar?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl text-gray-300 mb-12"
      >
        Regístrate y empieza a mejorar tu progreso con TENAX GYM.
      </motion.p>

      <Button
        onClick={() => navigate("/register")}
        variant="solid"
        className="inline-flex items-center gap-2 px-8 py-4 text-lg"
        aria-label="Start now"
      >
        Empezar <ArrowRight size={20} />
      </Button>
    </section>
  );
}