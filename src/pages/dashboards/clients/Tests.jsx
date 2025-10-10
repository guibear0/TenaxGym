//eslint-disable-next-line
import { motion } from "framer-motion";
import { Dumbbell, PersonStanding } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CardBox from "../../../components/ui/CardBox";
import BackButton from "../../../components/ui/BackButton";

export default function TestsPage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Test de Fuerza",
      icon: <Dumbbell size={48} />,
      description:
        "Registra tus marcas en ejercicios de fuerza (peso, repeticiones, etc.)",
      onClick: () => navigate("/tests/strength"),
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
    },
    {
      title: "Test de Movilidad",
      icon: <PersonStanding size={60} />,
      description:
        "Mide tu elasticidad y movilidad articular con tests específicos",
      onClick: () => navigate("/tests/mobility"),
      bgColor: "bg-teal-600",
      hoverColor: "hover:bg-teal-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
      {/* Back Button */}
      <div className="w-full max-w-6xl px-4 mb-8">
        <BackButton label="Atrás" to="/client-dashboard" />
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Elige el tipo de Test
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Selecciona entre fuerza o movilidad para registrar y seguir tu
          progreso
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {cards.map((card) => (
          <CardBox
            key={card.title}
            title={card.title}
            icon={card.icon}
            description={card.description}
            onClick={card.onClick}
            bgColor={card.bgColor}
            hoverColor={card.hoverColor}
          />
        ))}
      </div>
    </div>
  );
}
