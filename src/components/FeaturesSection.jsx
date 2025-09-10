//eslint-disable-next-line
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Scale } from "lucide-react";

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
    <section className="py-20 lg:py-32 relative bg-alice-blue">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título y descripción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Herramientas para
            <span className="text-blue-600 block">alcanzar tus metas</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu entrenamiento y progreso con tu entrenador.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon; 
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
