//eslint-disable-next-line
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Scale } from "lucide-react";
import Card from "../components/ui/Card";

const features = [
  {
    icon: Dumbbell,
    title: "Biblioteca de Ejercicios",
    description: "Accede a cientos de ejercicios detallados para cada grupo muscular.",
  },
  {
    icon: Scale,
    title: "Seguimiento de Progreso",
    description: "Registra tu peso, medidas y fotos para ver tu evolución.",
  },
  {
    icon: Calendar,
    title: "Calendario de Entrenamientos",
    description: "Organiza tus rutinas y sesiones semanales de manera eficiente.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 relative ">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-100 mb-6">
            Herramientas para
            <span className="text-blue-400 block">alcanzar tus metas</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu entrenamiento y progreso con tu entrenador.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={<feature.icon className="w-8 h-8 text-blue-400" />}
              className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}