import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Aquí llamamos al endpoint del backend
    axios.get("/api/user/dashboard", { withCredentials: true })
      .then(res => setUserData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!userData) return <p>Cargando datos...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Bienvenido/a, {userData.name}</h2>
      <p>Peso: {userData.weight} kg</p>
      <p>Altura: {userData.height} cm</p>
      <p>Edad: {userData.age} años</p>
    </div>
  );
}
