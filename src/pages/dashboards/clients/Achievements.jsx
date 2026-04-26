/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Trophy, Lock, Star, Flame, Dumbbell, Ruler, Calendar, ChevronRight } from "lucide-react";
import BackButton from "../components/ui/BackButton";

// ── Achievement definitions ───────────────────────────────────────────────────
// Each badge has: id, icon(emoji), title, desc, color, check(profile, stats) → bool
const ACHIEVEMENTS = [
  {
    id: "first_workout",
    icon: "🎯",
    title: "Primer Paso",
    desc: "Abre tu rutina por primera vez",
    color: "from-blue-600 to-blue-400",
    border: "border-blue-500/60",
    glow: "shadow-blue-900/50",
    check: (_, stats) => stats.totalExerciseDays >= 1,
  },
  {
    id: "streak_7",
    icon: "🔥",
    title: "Semana de Fuego",
    desc: "Registra actividad 7 días seguidos",
    color: "from-orange-600 to-yellow-400",
    border: "border-orange-500/60",
    glow: "shadow-orange-900/50",
    check: (_, stats) => stats.streak >= 7,
  },
  {
    id: "streak_30",
    icon: "💎",
    title: "Máquina Imparable",
    desc: "Entrena 30 días seguidos",
    color: "from-cyan-600 to-teal-400",
    border: "border-cyan-500/60",
    glow: "shadow-cyan-900/50",
    check: (_, stats) => stats.streak >= 30,
  },
  {
    id: "heavy_lifter",
    icon: "🏋️",
    title: "Gran Levantador",
    desc: "Registra una marca de fuerza de +100 kg",
    color: "from-red-700 to-red-400",
    border: "border-red-500/60",
    glow: "shadow-red-900/50",
    check: (_, stats) => stats.maxStrengthMark >= 100,
  },
  {
    id: "measures_recorded",
    icon: "📏",
    title: "Al Detalle",
    desc: "Registra al menos 5 mediciones corporales",
    color: "from-purple-600 to-violet-400",
    border: "border-purple-500/60",
    glow: "shadow-purple-900/50",
    check: (_, stats) => stats.totalMeasures >= 5,
  },
  {
    id: "measures_month",
    icon: "📈",
    title: "Progreso del Mes",
    desc: "Registra medidas corporales en este mes",
    color: "from-green-600 to-emerald-400",
    border: "border-green-500/60",
    glow: "shadow-green-900/50",
    check: (_, stats) => stats.measuresThisMonth >= 1,
  },
  {
    id: "strength_test",
    icon: "⚡",
    title: "Testeado",
    desc: "Completa al menos un test de fuerza",
    color: "from-yellow-600 to-amber-400",
    border: "border-yellow-500/60",
    glow: "shadow-yellow-900/50",
    check: (_, stats) => stats.totalStrengthTests >= 1,
  },
  {
    id: "mobility_test",
    icon: "🤸",
    title: "Flexible",
    desc: "Completa al menos un test de movilidad",
    color: "from-fuchsia-600 to-pink-400",
    border: "border-fuchsia-500/60",
    glow: "shadow-fuchsia-900/50",
    check: (_, stats) => stats.totalMobilityTests >= 1,
  },
  {
    id: "profile_complete",
    icon: "👤",
    title: "Perfil Completo",
    desc: "Rellena tu altura, peso y nombre en el perfil",
    color: "from-indigo-600 to-blue-400",
    border: "border-indigo-500/60",
    glow: "shadow-indigo-900/50",
    check: (profile) => !!(profile?.name && profile?.height && profile?.weight),
  },
  {
    id: "five_sessions",
    icon: "🗓️",
    title: "Veterano",
    desc: "Accede a tus ejercicios al menos 5 veces",
    color: "from-teal-600 to-cyan-400",
    border: "border-teal-500/60",
    glow: "shadow-teal-900/50",
    check: (_, stats) => stats.totalExerciseDays >= 5,
  },
];

// ── Badge Card ────────────────────────────────────────────────────────────────
function BadgeCard({ achievement, unlocked, newlyUnlocked }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: unlocked ? 1.04 : 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowDetail(true)}
        className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 overflow-hidden ${
          unlocked
            ? `${achievement.border} bg-gray-800/80 shadow-lg ${achievement.glow}`
            : "border-gray-700/40 bg-gray-800/30 opacity-60"
        }`}
      >
        {/* Glow bg for unlocked */}
        {unlocked && (
          <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-10 pointer-events-none`} />
        )}

        {/* NEW badge */}
        {newlyUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full"
          >
            ¡NUEVO!
          </motion.div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className={`text-4xl ${unlocked ? "" : "grayscale opacity-40"}`}>
            {unlocked ? achievement.icon : "🔒"}
          </div>
          <div>
            <p className={`font-bold text-sm ${unlocked ? "text-gray-100" : "text-gray-500"}`}>
              {achievement.title}
            </p>
            <p className={`text-xs mt-0.5 ${unlocked ? "text-gray-400" : "text-gray-600"}`}>
              {achievement.desc}
            </p>
          </div>
          {unlocked && (
            <div className={`w-full h-1 rounded-full bg-gradient-to-r ${achievement.color} opacity-70`} />
          )}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gray-900 border rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl ${achievement.border}`}
            >
              <div className={`text-6xl mb-4 ${unlocked ? "" : "grayscale opacity-40"}`}>
                {unlocked ? achievement.icon : "🔒"}
              </div>
              <h3 className="text-xl font-black text-gray-100 mb-2">{achievement.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{achievement.desc}</p>
              {unlocked ? (
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r ${achievement.color} text-white text-sm font-bold`}>
                  <Star className="w-4 h-4" />
                  Desbloqueado
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-700/60 text-gray-400 text-sm font-semibold">
                  <Lock className="w-4 h-4" />
                  Bloqueado
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Achievements() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState(new Set());

  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userId = profile?.id;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Strength tests
      const { data: strengthData } = await supabase
        .from("test_resultados")
        .select("marca")
        .eq("user_id", userId)
        .eq("tipo", "fuerza");

      // Mobility tests
      const { data: mobilityData } = await supabase
        .from("test_resultados")
        .select("id")
        .eq("user_id", userId)
        .eq("tipo", "movilidad");

      // Measures
      const { data: measuresData } = await supabase
        .from("perimetros")
        .select("fecha")
        .eq("user_id", userId);

      // Exercise access log — we use ejercicios_cliente as proxy
      const { data: exerciseDays } = await supabase
        .from("ejercicios_cliente")
        .select("numero_dia")
        .eq("client_id", userId);

      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const measuresThisMonth = (measuresData || []).filter((m) =>
        m.fecha?.startsWith(thisMonth)
      ).length;

      const maxStrengthMark = Math.max(
        0,
        ...(strengthData || []).map((r) => parseFloat(r.marca) || 0)
      );

      // Simple streak: consecutive days with measures (approx)
      const sortedDates = [...new Set((measuresData || []).map((m) => m.fecha))].sort();
      let streak = 0;
      if (sortedDates.length > 0) {
        streak = 1;
        for (let i = sortedDates.length - 1; i > 0; i--) {
          const diff =
            (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) /
            (1000 * 60 * 60 * 24);
          if (diff === 1) streak++;
          else break;
        }
      }

      const computed = {
        totalStrengthTests: (strengthData || []).length,
        totalMobilityTests: (mobilityData || []).length,
        totalMeasures: (measuresData || []).length,
        measuresThisMonth,
        maxStrengthMark,
        streak,
        totalExerciseDays: new Set((exerciseDays || []).map((e) => e.numero_dia)).size,
      };

      setStats(computed);

      // Check newly unlocked (compare with localStorage cache)
      const prevUnlocked = JSON.parse(localStorage.getItem(`achievements_${userId}`) || "[]");
      const nowUnlocked = ACHIEVEMENTS.filter((a) => a.check(profile, computed)).map((a) => a.id);
      const freshlyUnlocked = nowUnlocked.filter((id) => !prevUnlocked.includes(id));
      setNewlyUnlocked(new Set(freshlyUnlocked));
      localStorage.setItem(`achievements_${userId}`, JSON.stringify(nowUnlocked));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = stats
    ? ACHIEVEMENTS.filter((a) => a.check(profile, stats)).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton label="Atrás" to="/client-dashboard" />
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Logros
          </h1>
          <div className="w-20" />
        </div>

        {/* Progress Summary */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/70 border border-gray-700/50 rounded-2xl p-5 mb-8 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-400">Logros desbloqueados</p>
              <p className="text-3xl font-black text-yellow-400">
                {unlockedCount}
                <span className="text-lg text-gray-500 font-medium">/{ACHIEVEMENTS.length}</span>
              </p>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
            <div className="text-2xl">
              {unlockedCount === ACHIEVEMENTS.length ? "🏆" : unlockedCount >= ACHIEVEMENTS.length / 2 ? "⭐" : "🎯"}
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Calculando logros...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement, i) => {
              const unlocked = achievement.check(profile, stats);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BadgeCard
                    achievement={achievement}
                    unlocked={unlocked}
                    newlyUnlocked={newlyUnlocked.has(achievement.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}