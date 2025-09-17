//eslint-disable-next-line
import { motion } from "framer-motion";
import { useState} from "react";
import ClientExercisesDay from "./Exercises";
import BackButton from "../../../components/ui/BackButton";

export default function DaySelector() {
  const [selectedDay, setSelectedDay] = useState(1);
  const days = [1, 2, 3, 4, 5];

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userName = userProfile?.name || "";

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <BackButton label="Atrás" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {userName ? `${userName}` : "!"} ¡Mira tus ejercicios por día!
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8"
        >
          {/* Selector de días */}
          <div className="flex justify-center gap-3 mb-6">
            {days.map((day) => (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer w-12 h-12 rounded-lg font-semibold text-lg ${
                  selectedDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-white"
                } transition-all duration-50`}
                aria-label={`Select Day ${day}`}
              >
                {day}
              </motion.button>
            ))}
          </div>

          {/* Mostrar ejercicios del día seleccionado */}
          <ClientExercisesDay day={selectedDay} />
        </motion.div>
      </div>
    </div>
  );
}