import { supabase } from "../../lib/supabase";

export default function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="p-4 flex justify-end">
      <div 
        onClick={handleLogout} 
        className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer"
        title="Cerrar sesión"
      ></div>
    </nav>
  );
}
