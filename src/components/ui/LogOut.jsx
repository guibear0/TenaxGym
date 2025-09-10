import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
    >
      <LogOut className="w-5 h-5 text-white" />
    </button>
  );
}
