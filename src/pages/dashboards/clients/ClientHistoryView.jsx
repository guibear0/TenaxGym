import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientWorkoutHistory from "../../../components/ClientWorkoutHistory";
import BackButton from "../../../components/ui/BackButton";

export default function ClientHistoryView() {
  const [clientId, setClientId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userProfile"));
    if (user && user.id) {
      setClientId(user.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!clientId) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <BackButton label="Atrás" to="/client-dashboard" />
      </div>

      <ClientWorkoutHistory clientId={clientId} />
    </div>
  );
}
