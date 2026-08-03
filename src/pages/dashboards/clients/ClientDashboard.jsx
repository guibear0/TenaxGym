import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Ruler, BookOpenCheck, Flame, Trophy, CalendarDays } from "lucide-react";
import CardBox from "../../../components/ui/CardBox";
import Navbar from "../../../components/ui/NavBar";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  const quotes = [
    "El único entrenamiento malo es el que no se realiza.",
    "Esfuérzate porque nadie más lo hará por ti.",
    "Tu cuerpo puede soportar casi cualquier cosa. Es a tu mente a quien tienes que convencer.",
    "El éxito comienza con la autodisciplina.",
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userProfile"));
    if (user && user.name) setUserName(user.name);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos Días");
    else if (hour < 21) setGreeting("Buenas Tardes");
    else setGreeting("Buenas Noches");

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    //eslint-disable-next-line
  }, []);

  const cards = [
    {
      title: "Perfil",
      icon: <User size={44} />,
      description: "Visualiza y edita la información de tu perfil",
      onClick: () => navigate("/profile"),
      bgColor: "#1e3a8a", // azul oscuro armonizado
      hoverColor: "#3b82f6", // azul brillante
    },
    {
      title: "Entrenamiento",
      icon: <Flame size={44} />,
      description: "Accede a tu rutina diaria, test previo y registro en vivo",
      onClick: () => navigate("/workout-live"),
      bgColor: "#7f1d1d", // rojo/naranja oscuro
      hoverColor: "#ef4444", // rojo brillante
    },
    {
      title: "Medidas Corporales",
      icon: <Ruler size={44} />,
      description: "Registra y monitorea tus medidas corporales",
      onClick: () => navigate("/measures"),
      bgColor: "#5b21b6", // morado oscuro
      hoverColor: "#9333ea", // morado brillante
    },
    {
      title: "Tests",
      icon: <BookOpenCheck size={44} />,
      description:
        "Haz los tests de fuerza y movilidad y registra tus progresos",
      onClick: () => navigate("/tests"),
      bgColor: "#c2410c", // naranja oscuro suave
      hoverColor: "#fb923c", // naranja brillante
    },
    {
      title: "Logros",
      icon: <Trophy size={44} />,
      description: "Consulta tus medallas y recompensas conseguidas",
      onClick: () => navigate("/achievements"),
      bgColor: "#78350f",
      hoverColor: "#f59e0b",
    },
    {
      title: "Calendario de Sesiones",
      icon: <CalendarDays size={44} />,
      description: "Consulta tu historial de entrenamientos, tests y observaciones",
      onClick: () => navigate("/workout-history"),
      bgColor: "#047857",
      hoverColor: "#10b981",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-8 px-4">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="text-center mb-8 mt-4 max-w-xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {greeting}
          {userName ? `, ${userName}!` : "!"} ¡Vamos a movernos!
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-300 italic">"{quote}"</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-4xl px-2">
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
