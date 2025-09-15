import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Activity, Calendar, UserCog  } from "lucide-react";
import CardBox from "../../../components/ui/CardBox";

export default function TrainerDashboard() {
   const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userProfile"));
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const cards = [
    {
      title: "Perfil",
      icon: <User size={48} />,
      onClick: () => navigate("/profile"),
    },
    {
      title: "Clientes",
      icon: <UserCog size={48} />,
      onClick: () => navigate("/clients"),
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-800">
        Esta es tu página de entrenador{userName ? `, ${userName}` : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {cards.map((card) => (
          <CardBox
            key={card.title}
            title={card.title}
            icon={card.icon}
            onClick={card.onClick}
          />
        ))}
      </div>
    </div>
  );
}

