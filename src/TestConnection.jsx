import { useEffect, useState } from "react";

export default function TestConnection() {
  const [data, setData] = useState(null);

  useEffect(() => {
  fetch('https://tenaxgymbackend.onrender.com/api/ping', {
    method: "GET",
    credentials: "include", // permite enviar cookies
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error en la respuesta");
      return res.json();
    })
    .then((data) => setData(data))
    .catch((err) => console.error("Error:", err));
}, []);

  return (
    <div>
      <h1>Test conexión con Laravel</h1>
      {data ? <pre>{JSON.stringify(data)}</pre> : <p>Cargando...</p>}
    </div>
  );
}
