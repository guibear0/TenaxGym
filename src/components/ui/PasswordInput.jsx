import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ value, onChange, placeholder = "Contraseña" }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex items-center border px-2 py-1 rounded flex-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 outline-none"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="ml-2 text-gray-500"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
