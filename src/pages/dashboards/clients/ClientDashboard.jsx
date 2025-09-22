//eslint-disable-next-line
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Activity } from "lucide-react";
import CardBox from "../../../components/ui/CardBox";
import Navbar from "../../../components/ui/NavBar";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  // Sample quotes (could be fetched from an API)
  const quotes = [
    "El único entrenamiento malo es el que no se realiza.",
    "Esfuérzate porque nadie más lo hará por ti.",
    "Tu cuerpo puede soportar casi cualquier cosa. Es a tu mente a quien tienes que convencer.",
    "El éxito comienza con la autodisciplina.",
  ];

  useEffect(() => {
    // Set user name
    const user = JSON.parse(localStorage.getItem("userProfile"));
    if (user && user.name) {
      setUserName(user.name);
    }

    // Set dynamic greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos Días");
    else if (hour < 21) setGreeting("Buenas Tardes");
    else setGreeting("Buenas Noches");

    // Set random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    //eslint-disable-next-line
  }, []);

  const cards = [
    {
      title: "Perfil",
      icon: <User size={48} />,
      description: "Visualiza y edita la información de tu perfil",
      onClick: () => navigate("/profile"),
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    {
      title: "Ejercicios",
      icon: <Activity size={48} />,
      description: "Accede a tus entrenamientos diarios",
      onClick: () => navigate("/day-selector"),
      bgColor: "bg-green-600",
      hoverColor: "hover:bg-green-700",
    },
    {
      title: "Medidas Corporales",
      icon: <Activity size={48} />,
      description: "Registra y monitorea tus medidas corporales",
      onClick: () => navigate("/measures"),
      bgColor: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
      {/* Navbar */}
      <Navbar />
      
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {greeting}{userName ? `, ${userName}!` : "!"} ¡Vamos a movernos!
        </h1>
        <p className="mt-4 text-lg text-gray-300 italic">"{quote}"</p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-6xl px-4">
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