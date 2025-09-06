export default function FeaturesSection() {
  const features = [
    {
      title: "Rutinas personalizadas",
      description: "Recibe entrenamientos diseñados por tu entrenador.",
    },
    {
      title: "Seguimiento de progreso",
      description: "Registra tu peso, altura y mejora en cada sesión.",
    },
    {
      title: "Acceso 24/7",
      description: "Consulta tu plan desde cualquier dispositivo.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">
        ¿Por qué elegir TENAX GYM?
      </h2>
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-xl shadow p-6 text-center"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
