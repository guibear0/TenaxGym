import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Falta el email" });
    }

    // ⚡ Enlace de reseteo
    const resetLink = `https://tenax-gym.vercel.app/reset-password?email=${encodeURIComponent(
      email
    )}`;

    const { data, error } = await resend.emails.send({
      from: "Tenax Gym <no-reply@tenax-gym.vercel.app>", // 👈 importante usar dominio verificado
      to: email,
      subject: "Recupera tu contraseña - Tenax Gym",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
