// DaySelector.js
import { useState } from "react";
import ClientExercisesDay from "./Exercises";

export default function DaySelector() {
  const [selectedDay, setSelectedDay] = useState(1);

  const days = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Mis ejercicios por día</h1>

      {/* Selector de días */}
      <div className="flex justify-center gap-4 mb-6">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`w-12 h-12 rounded-full font-bold text-lg 
              ${selectedDay === day ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} 
              hover:bg-blue-500 transition`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Mostrar ejercicios del día seleccionado */}
      <ClientExercisesDay day={selectedDay} />
    </div>
  );
}
