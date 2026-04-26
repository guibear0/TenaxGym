/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Zap,
  BicepsFlexed,
  Scale,
  HeartPulse,
  PlayCircle,
  Clock,
  Repeat,
  StickyNote,
  Trophy,
  X,
  Dumbbell,
  Timer,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import BackButton from "../components/ui/BackButton";

// ── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const typeMapping = {
  CALENTAMIENTO: "Calentamiento",
  BLOQUE_FUERZA: "Fuerza",
  ESTABILIDAD_CARDIO: "Estabilidad",
  CARDIO: "Cardio",
};

const typeColors = {
  Calentamiento: "border-yellow-500 text-yellow-400",
  Fuerza: "border-orange-500 text-orange-400",
  Estabilidad: "border-fuchsia-500 text-fuchsia-400",
  Cardio: "border-red-500 text-red-400",
  Otros: "border-gray-500 text-gray-400",
};

const typeIcons = {
  Calentamiento: Zap,
  Fuerza: BicepsFlexed,
  Estabilidad: Scale,
  Cardio: HeartPulse,
  Otros: PlayCircle,
};

const typeOrder = ["Calentamiento", "Fuerza", "Estabilidad", "Cardio"];

// ── Confetti burst ────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444"];
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${10 + (i * 83) % 90}%`,
            top: "-20px",
            backgroundColor: colors[i % colors.length],
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            x: [0, (i % 2 === 0 ? 60 : -60) * Math.sin(i)],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.6 + (i % 5) * 0.2, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
function RestTimer({ seconds, onSkip, onFinish, soundEnabled }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  // beep via AudioContext
  const beep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) { }
  }, [soundEnabled]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      beep();
      onFinish();
      return;
    }
    if (remaining <= 3) beep();
    intervalRef.current = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(intervalRef.current);
  }, [remaining]);

  const pct = remaining / seconds;
  const circumference = 2 * Math.PI * 54;
  const stroke = circumference * (1 - pct);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 flex flex-col items-center gap-6 max-w-xs w-full shadow-2xl">
        <p className="text-gray-300 font-semibold text-lg tracking-wider uppercase">Descanso</p>

        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke={remaining <= 3 ? "#EF4444" : "#3B82F6"}
              strokeDasharray={circumference}
              strokeDashoffset={stroke}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-black tabular-nums ${remaining <= 3 ? "text-red-400" : "text-white"}`}>
              {remaining}
            </span>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
          Saltar
        </button>
      </div>
    </motion.div>
  );
}

// ── Set Row ───────────────────────────────────────────────────────────────────
function SetRow({ setNum, planned, actual, onChange, onComplete, completed }) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all duration-300 ${completed
          ? "border-green-500/50 bg-green-900/20"
          : "border-gray-700/60 bg-gray-900/40"
        }`}
    >
      <span className="text-gray-500 text-sm w-6 text-center font-bold">{setNum}</span>

      {/* Peso planificado */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500 mb-0.5">Plan</p>
        <p className="text-xs text-gray-400 truncate">{planned || "—"}</p>
      </div>

      {/* Peso real */}
      <input
        type="text"
        placeholder="kg"
        value={actual.weight}
        onChange={(e) => onChange({ ...actual, weight: e.target.value })}
        disabled={completed}
        className="w-14 sm:w-16 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm text-center focus:outline-none focus:border-blue-500 disabled:opacity-50"
      />

      {/* Reps reales */}
      <input
        type="text"
        placeholder="reps"
        value={actual.reps}
        onChange={(e) => onChange({ ...actual, reps: e.target.value })}
        disabled={completed}
        className="w-14 sm:w-16 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm text-center focus:outline-none focus:border-blue-500 disabled:opacity-50"
      />

      {/* Completar */}
      <button
        onClick={onComplete}
        disabled={completed}
        className="flex-shrink-0 cursor-pointer disabled:cursor-default"
      >
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        ) : (
          <Circle className="w-6 h-6 text-gray-600 hover:text-blue-400 transition" />
        )}
      </button>
    </motion.div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, restTime, onSetComplete, soundEnabled }) {
  const defaultSets = 3;
  const [sets, setSets] = useState(() =>
    Array.from({ length: defaultSets }, () => ({ weight: "", reps: "", completed: false }))
  );
  const [expanded, setExpanded] = useState(true);
  const [showRest, setShowRest] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const completedCount = sets.filter((s) => s.completed).length;
  const allDone = completedCount === sets.length;

  const handleComplete = (idx) => {
    if (sets[idx].completed) return;
    const updated = sets.map((s, i) => (i === idx ? { ...s, completed: true } : s));
    setSets(updated);
    const nowDone = updated.filter((s) => s.completed).length;
    if (nowDone === sets.length) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1800);
      onSetComplete?.(ex, updated);
    } else {
      setShowRest(true);
    }
  };

  const handleRestFinish = () => setShowRest(false);

  return (
    <>
      <Confetti active={confetti} />
      <AnimatePresence>
        {showRest && (
          <RestTimer
            seconds={restTime}
            onSkip={() => setShowRest(false)}
            onFinish={handleRestFinish}
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${allDone ? "border-green-500/60 bg-green-950/30" : "border-gray-700/50 bg-gray-800/60"
          }`}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
        >
          {ex.catalogo_ejercicios?.imagen && (
            <img
              src={ex.catalogo_ejercicios.imagen}
              alt={ex.catalogo_ejercicios.nombre}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm sm:text-base truncate ${allDone ? "text-green-300" : "text-gray-100"}`}>
              {ex.catalogo_ejercicios?.nombre}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {ex.n_reps && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Repeat className="w-3 h-3 text-yellow-400" /> {ex.n_reps}
                </span>
              )}
              {ex.duracion && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3 text-green-400" /> {ex.duracion}
                </span>
              )}
              {ex.descripcion && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <StickyNote className="w-3 h-3 text-gray-500" /> {ex.descripcion}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${allDone ? "bg-green-900/60 text-green-300" : "bg-gray-700/60 text-gray-400"
              }`}>
              {completedCount}/{sets.length}
            </span>
            {allDone && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>

        {/* Sets */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden px-4 pb-4 space-y-2"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="grid grid-cols-4 gap-2 flex-1 text-[10px] text-gray-500 uppercase tracking-wide px-1">
                  <span className="text-center">#</span>
                  <span>Plan</span>
                  <span className="text-center">kg</span>
                  <span className="text-center">reps</span>
                </div>
                <div className="w-6" />
              </div>

              {sets.map((s, i) => (
                <SetRow
                  key={i}
                  setNum={i + 1}
                  planned={ex.n_reps}
                  actual={s}
                  onChange={(updated) =>
                    setSets((prev) => prev.map((x, j) => (j === i ? updated : x)))
                  }
                  onComplete={() => handleComplete(i)}
                  completed={s.completed}
                />
              ))}

              {/* Add set */}
              {!allDone && (
                <button
                  onClick={() => setSets((prev) => [...prev, { weight: "", reps: "", completed: false }])}
                  className="w-full py-1.5 rounded-xl border border-dashed border-gray-600 text-gray-500 hover:border-blue-500 hover:text-blue-400 text-xs transition cursor-pointer"
                >
                  + Serie
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ── Elapsed Timer ─────────────────────────────────────────────────────────────
function ElapsedTimer({ running }) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <span className="font-black tabular-nums text-blue-300">
      {h > 0 && `${pad(h)}:`}{pad(m)}:{pad(s)}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkoutLive() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showFinish, setShowFinish] = useState(false);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const clientId = userProfile?.id;

  useEffect(() => {
    fetchExercises();
  }, [day]);

  const fetchExercises = async () => {
    setLoading(true);
    setStarted(false);
    setTimerRunning(false);
    setCompletedExercises(new Set());
    try {
      const { data, error } = await supabase
        .from("ejercicios_cliente")
        .select("*, catalogo_ejercicios(nombre, tipo, imagen)")
        .eq("client_id", clientId)
        .eq("numero_dia", day)
        .order("orden", { ascending: true });
      if (error) throw error;
      setExercises(data || []);
    } catch (_) {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const grouped = exercises.reduce((acc, ex) => {
    const raw = ex.catalogo_ejercicios?.tipo || "Otros";
    const type = typeMapping[raw] || "Otros";
    if (!acc[type]) acc[type] = [];
    acc[type].push(ex);
    return acc;
  }, {});

  const totalExercises = exercises.length;
  const donePct = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;

  const handleSetComplete = (ex) => {
    setCompletedExercises((prev) => new Set([...prev, ex.id]));
    if (completedExercises.size + 1 >= totalExercises) {
      setTimeout(() => setShowFinish(true), 600);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <BackButton label="Atrás" to="/day-selector" />

          <div className="flex items-center gap-3">
            {/* Elapsed */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700/50">
              <Timer className="w-3.5 h-3.5 text-blue-400" />
              <ElapsedTimer running={timerRunning} />
            </div>

            {/* Sound */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="p-2 rounded-xl bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Pause/Resume */}
            {started && (
              <button
                onClick={() => setTimerRunning((r) => !r)}
                className="p-2 rounded-xl bg-blue-600/80 border border-blue-500/50 text-white hover:bg-blue-500 transition cursor-pointer"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {started && (
          <div className="max-w-2xl mx-auto mt-2">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                animate={{ width: `${donePct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>{completedExercises.size} completados</span>
              <span>{totalExercises} total</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Title + Day Selector */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-100 flex items-center justify-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-400" />
            Entrenamiento en Vivo
          </h1>
          <p className="text-gray-400 text-sm mt-1">Marca tus series y registra tus resultados</p>
        </div>

        {/* Day Selector */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => { setDay(d); }}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${d === day
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/60"
                }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Rest Time Config */}
        <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700/50 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-gray-200">Descanso por defecto</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestTime((t) => Math.max(10, t - 10))}
              className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition cursor-pointer"
            >−</button>
            <span className="text-blue-300 font-black w-12 text-center">{restTime}s</span>
            <button
              onClick={() => setRestTime((t) => Math.min(300, t + 10))}
              className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition cursor-pointer"
            >+</button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando ejercicios...</div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay ejercicios para el Día {day}</p>
          </div>
        ) : !started ? (
          /* START SCREEN */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center">
              <Play className="w-10 h-10 text-blue-400 ml-1" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-100">{exercises.length} ejercicios</p>
              <p className="text-gray-400 text-sm mt-1">Día {day} · Lista para comenzar</p>
            </div>

            {/* Preview */}
            <div className="w-full space-y-2">
              {typeOrder.map((type) => {
                if (!grouped[type]) return null;
                const Icon = typeIcons[type];
                const col = typeColors[type];
                return (
                  <div key={type} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border-l-4 ${col.split(" ")[0]}`}>
                    <Icon className={`w-4 h-4 ${col.split(" ")[1]}`} />
                    <span className="text-sm text-gray-300 font-medium">{type}</span>
                    <span className="ml-auto text-xs text-gray-500">{grouped[type].length} ejerc.</span>
                  </div>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-900/50 transition cursor-pointer"
            >
              <Play className="w-5 h-5" />
              ¡Empezar Entrenamiento!
            </motion.button>
          </motion.div>
        ) : (
          /* LIVE MODE */
          <div className="space-y-8">
            {typeOrder.map((type) => {
              if (!grouped[type]) return null;
              const Icon = typeIcons[type];
              const col = typeColors[type];
              return (
                <div key={type}>
                  <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${col.split(" ")[0].replace("border-", "border-b-")}`}>
                    <Icon className={`w-5 h-5 ${col.split(" ")[1]}`} />
                    <h2 className={`font-bold text-base ${col.split(" ")[1]}`}>{type}</h2>
                    <span className="ml-auto text-xs text-gray-500">
                      {grouped[type].filter((ex) => completedExercises.has(ex.id)).length}/{grouped[type].length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {grouped[type].map((ex) => (
                      <ExerciseCard
                        key={ex.id}
                        ex={ex}
                        restTime={restTime}
                        onSetComplete={handleSetComplete}
                        soundEnabled={soundEnabled}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Finish Modal */}
      <AnimatePresence>
        {showFinish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border border-green-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-black text-green-400 mb-2">¡Entrenamiento completado!</h2>
              <p className="text-gray-400 text-sm mb-6">Excelente trabajo. Has terminado todos los ejercicios del Día {day}.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFinish(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition cursor-pointer"
                >
                  Ver resumen
                </button>
                <button
                  onClick={() => window.location.href = "/client-dashboard"}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-500 transition cursor-pointer"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}