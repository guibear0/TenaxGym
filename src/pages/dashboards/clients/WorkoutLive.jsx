/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  X,
  Dumbbell,
  Timer,
  SkipForward,
  Volume2,
  VolumeX,
  Brain,
  Moon,
  Smile,
  CheckCheck,
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import BackButton from "../../../components/ui/BackButton";
import { toast } from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const typeMapping = {
  CALENTAMIENTO: "Calentamiento",
  BLOQUE_FUERZA: "Fuerza",
  ESTABILIDAD_CARDIO: "Estabilidad",
  CARDIO: "Cardio",
};

const typeColors = {
  Calentamiento: "border-yellow-500 text-yellow-400 bg-yellow-950/20",
  Fuerza: "border-orange-500 text-orange-400 bg-orange-950/20",
  Estabilidad: "border-fuchsia-500 text-fuchsia-400 bg-fuchsia-950/20",
  Cardio: "border-red-500 text-red-400 bg-red-950/20",
  Otros: "border-gray-500 text-gray-400 bg-gray-900/20",
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
  const pieces = Array.from({ length: 20 }, (_, i) => i);
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444"];
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${5 + (i * 79) % 90}%`,
            top: "-20px",
            backgroundColor: colors[i % colors.length],
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            x: [0, (i % 2 === 0 ? 50 : -50) * Math.sin(i)],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.5 + (i % 5) * 0.2, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Rest Timer Modal (Mobile Optimized) ───────────────────────────────────────
function RestTimer({ seconds, onSkip, onFinish, soundEnabled }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

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
    } catch (_) {}
  }, [soundEnabled]);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { beep(); onFinish(); return; }
    if (remaining <= 3) beep();
    intervalRef.current = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(intervalRef.current);
  }, [remaining]);

  const pct = remaining / seconds;
  const circumference = 2 * Math.PI * 52;
  const stroke = circumference * (1 - pct);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        className="bg-gray-900 border border-gray-700/80 rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full shadow-2xl"
      >
        <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Descanso</p>
        
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke={remaining <= 3 ? "#EF4444" : "#3B82F6"}
              strokeDasharray={circumference}
              strokeDashoffset={stroke}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-black tabular-nums ${remaining <= 3 ? "text-red-400" : "text-white"}`}>
              {remaining}s
            </span>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
        >
          <SkipForward className="w-5 h-5" />
          Saltar Descanso
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Set Row (Mobile Optimized with 44px Touch Targets) ────────────────────────
function SetRow({ setNum, planned, actual, onChange, onComplete, completed }) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300 ${
        completed
          ? "border-green-500/50 bg-green-950/30"
          : "border-gray-700/60 bg-gray-900/50"
      }`}
    >
      <span className="text-gray-400 text-xs w-6 text-center font-bold">{setNum}</span>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500 font-semibold uppercase">Plan</p>
        <p className="text-xs text-gray-300 truncate font-medium">{planned || "—"}</p>
      </div>

      <input
        type="text"
        inputMode="decimal"
        placeholder="kg"
        value={actual.weight}
        onChange={(e) => onChange({ ...actual, weight: e.target.value })}
        disabled={completed}
        className="w-16 h-10 px-2 rounded-xl bg-gray-800 border border-gray-600 text-white text-sm text-center font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
      />

      <input
        type="text"
        inputMode="numeric"
        placeholder="reps"
        value={actual.reps}
        onChange={(e) => onChange({ ...actual, reps: e.target.value })}
        disabled={completed}
        className="w-16 h-10 px-2 rounded-xl bg-gray-800 border border-gray-600 text-white text-sm text-center font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
      />

      <button
        onClick={onComplete}
        disabled={completed}
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 cursor-pointer disabled:cursor-default rounded-xl hover:bg-gray-800 transition active:scale-95"
      >
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        ) : (
          <Circle className="w-6 h-6 text-gray-500 hover:text-blue-400 transition" />
        )}
      </button>
    </motion.div>
  );
}

// ── Exercise Card (Mobile First with Image Preview Modal) ─────────────────────
function ExerciseCard({ ex, restTime, onSetComplete, soundEnabled, onOpenImage }) {
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

  return (
    <>
      <Confetti active={confetti} />
      <AnimatePresence>
        {showRest && (
          <RestTimer
            seconds={restTime}
            onSkip={() => setShowRest(false)}
            onFinish={() => setShowRest(false)}
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
          allDone ? "border-green-500/60 bg-green-950/20 shadow-lg shadow-green-950/30" : "border-gray-700/60 bg-gray-800/80"
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center gap-3 p-3 sm:p-4">
          {ex.catalogo_ejercicios?.imagen && (
            <button
              onClick={() => onOpenImage(ex.catalogo_ejercicios.imagen)}
              className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-blue-500/40 group cursor-pointer active:scale-95 transition"
              title="Toca para ver imagen completa"
            >
              <img
                src={ex.catalogo_ejercicios.imagen}
                alt={ex.catalogo_ejercicios.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
                <Maximize2 className="w-4 h-4 text-white drop-shadow" />
              </div>
            </button>
          )}

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded((e) => !e)}
          >
            <p className={`font-bold text-sm sm:text-base truncate ${allDone ? "text-green-300" : "text-gray-100"}`}>
              {ex.catalogo_ejercicios?.nombre}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {ex.n_reps && (
                <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                  <Repeat className="w-3.5 h-3.5 text-yellow-400" /> {ex.n_reps}
                </span>
              )}
              {ex.duracion && (
                <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-green-400" /> {ex.duracion}
                </span>
              )}
              {ex.descanso && (
                <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-400" /> {ex.descanso}
                </span>
              )}
            </div>
            {ex.descripcion && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                {ex.descripcion}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                allDone ? "bg-green-900/60 text-green-300 border border-green-700/50" : "bg-gray-700/80 text-gray-300"
              }`}
            >
              {completedCount}/{sets.length}
            </span>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1 rounded-lg hover:bg-gray-700/60 text-gray-400 cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sets Section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden px-3 pb-3 space-y-2 border-t border-gray-700/40 pt-2"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2">
                <span className="w-6 text-center">#</span>
                <span className="flex-1">Objetivo</span>
                <span className="w-16 text-center">Kg</span>
                <span className="w-16 text-center">Reps</span>
                <span className="w-10 text-center">OK</span>
              </div>

              {sets.map((s, i) => (
                <SetRow
                  key={i}
                  setNum={i + 1}
                  planned={ex.n_reps}
                  actual={s}
                  onChange={(updated) => setSets((prev) => prev.map((x, j) => (j === i ? updated : x)))}
                  onComplete={() => handleComplete(i)}
                  completed={s.completed}
                />
              ))}

              {!allDone && (
                <button
                  onClick={() => setSets((prev) => [...prev, { weight: "", reps: "", completed: false }])}
                  className="w-full py-2 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:border-blue-400 hover:text-blue-300 text-xs font-semibold transition cursor-pointer active:scale-98"
                >
                  + Añadir otra serie
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ── Elapsed Timer Component ───────────────────────────────────────────────────
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
    <span className="font-black tabular-nums text-blue-300 text-sm">
      {h > 0 && `${pad(h)}:`}{pad(m)}:{pad(s)}
    </span>
  );
}

// ── Pre-session Test (Mobile First) ───────────────────────────────────────────
function TestPrevio({ onSubmit }) {
  const [values, setValues] = useState({ fatigue: 0, sleep: 0, mood: 0 });
  const indicadores = [
    { key: "fatigue", label: "Cansancio", icon: Brain, color: "text-red-400" },
    { key: "sleep", label: "Sueño", icon: Moon, color: "text-indigo-400" },
    { key: "mood", label: "Estado de ánimo", icon: Smile, color: "text-yellow-400" },
  ];

  const allSelected = Object.values(values).every((v) => v >= 1 && v <= 5);

  const handleSubmit = () => {
    if (!allSelected) {
      toast.error("Selecciona un valor para cada indicador");
      return;
    }
    onSubmit(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 py-2"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-gray-100 mb-1">¿Cómo te encuentras hoy?</h2>
        <p className="text-gray-400 text-xs sm:text-sm">Test previo rápido · 1 = bajo / 5 = excelente</p>
      </div>

      <div className="w-full space-y-4">
        {indicadores.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700/60 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="font-bold text-sm text-gray-100">{label}</span>
              </div>
              {values[key] > 0 && (
                <span className={`text-xl font-black ${color}`}>{values[key]}</span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setValues((prev) => ({ ...prev, [key]: v }))}
                  className={`h-11 rounded-xl font-bold text-base transition active:scale-95 cursor-pointer ${
                    values[key] === v
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 scale-105"
                      : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                  }`}
                  aria-label={`${label} ${v}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allSelected}
        className={`w-full py-4 font-black text-base rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
          allSelected
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Play className="w-5 h-5" />
        Comenzar Entrenamiento
      </button>
    </motion.div>
  );
}

// ── Finish Session Modal (Mobile Bottom Sheet / Centered) ─────────────────────
function FinishModal({ day, onClose, onConfirm, saving }) {
  const [comments, setComments] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 20 }}
        className="bg-gray-900 border border-green-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-green-400 mb-1">¡Sesión finalizada!</h2>
          <p className="text-gray-400 text-xs">Día {day} · Has completado el entrenamiento</p>
        </div>

        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Comentarios finales del entrenamiento
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Sensaciones del cliente, molestias, ejercicios que costaron..."
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs hover:bg-gray-700 transition cursor-pointer"
          >
            Volver
          </button>
          <button
            onClick={() => onConfirm(comments)}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-500 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            {saving ? "Guardando..." : "Completar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component (Mobile-First Unified Live Workout View with Touch Swipe) ─
export default function WorkoutLive() {
  const [exercises, setExercises] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(1);
  const [trainingDays, setTrainingDays] = useState(5);
  const [dayNames, setDayNames] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  // phase: "idle" | "test" | "started"
  const [phase, setPhase] = useState("idle");
  // viewMode: "swipe" (deslizar en móvil) | "list" (ver todos juntos)
  const [viewMode, setViewMode] = useState("swipe");
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showFinish, setShowFinish] = useState(false);
  const [savingFinish, setSavingFinish] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completedTodaySet, setCompletedTodaySet] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const clientId = userProfile?.id;

  // Cargar training_days y nombres de días del cliente
  useEffect(() => {
    if (!clientId) return;
    const fetchTrainingDays = async () => {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("training_days")
          .eq("id_cliente", clientId)
          .single();
        if (!error && data?.training_days) {
          setTrainingDays(data.training_days);
        }

        const { data: namesData } = await supabase
          .from("training_day_config")
          .select("day_number, day_name")
          .eq("client_id", clientId);

        if (namesData) {
          const map = {};
          namesData.forEach((n) => { map[n.day_number] = n.day_name; });
          setDayNames(map);
        }
      } catch (_) {}
    };
    fetchTrainingDays();
  }, [clientId]);

  // Cargar sesiones completadas hoy
  const fetchCompletedToday = async () => {
    if (!clientId) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("workout_sessions")
        .select("numero_dia")
        .eq("client_id", clientId)
        .eq("fecha", today)
        .eq("completed", true);
      if (data) {
        setCompletedTodaySet(new Set(data.map((s) => s.numero_dia)));
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchCompletedToday();
  }, [clientId]);

  // Al cambiar de día
  useEffect(() => {
    fetchDayData();
  }, [day, clientId]);

  const fetchDayData = async () => {
    if (!clientId) return;
    setLoading(true);
    setPhase("idle");
    setCurrentExIdx(0);
    setTimerRunning(false);
    setCompletedExercises(new Set());

    try {
      // 1. Ejercicios del día
      const { data: exData, error: exErr } = await supabase
        .from("ejercicios_cliente")
        .select("*, catalogo_ejercicios(nombre, tipo, imagen)")
        .eq("client_id", clientId)
        .eq("numero_dia", day)
        .order("orden", { ascending: true });
      if (exErr) throw exErr;
      setExercises(exData || []);

      // 2. Comentarios del entrenador por bloque
      const { data: comData } = await supabase
        .from("comentarios_bloque")
        .select("*")
        .eq("client_id", clientId)
        .eq("numero_dia", day);

      const map = {};
      if (comData) {
        comData.forEach((c) => {
          const uiType = typeMapping[c.tipo] || "Otros";
          map[uiType] = c.comentario;
        });
      }
      setComments(map);

      // 3. Comprobar si ya fue completada hoy
      const today = new Date().toISOString().split("T")[0];
      const { data: sessData } = await supabase
        .from("workout_sessions")
        .select("id, completed")
        .eq("client_id", clientId)
        .eq("numero_dia", day)
        .eq("fecha", today)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessData?.length > 0) {
        setSessionId(sessData[0].id);
        setSessionCompleted(sessData[0].completed);
      } else {
        setSessionId(null);
        setSessionCompleted(false);
      }
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

  // Crear sesión y guardar test previo
  const handleTestSubmit = async (testValues) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([{
          client_id: clientId,
          numero_dia: day,
          fecha: today,
          fatigue: testValues.fatigue,
          sleep: testValues.sleep,
          mood: testValues.mood,
          test_completed: true,
        }])
        .select()
        .single();
      if (error) throw error;
      setSessionId(data.id);
    } catch (err) {
      toast.error("Error guardando test: " + err.message);
    }
    setPhase("started");
    setTimerRunning(true);
  };

  // Finalizar sesión
  const handleFinishConfirm = async (finalComments) => {
    setSavingFinish(true);
    try {
      const completedAt = new Date().toISOString();
      if (sessionId) {
        const { error } = await supabase
          .from("workout_sessions")
          .update({
            completed: true,
            completed_at: completedAt,
            final_comments: finalComments || null,
          })
          .eq("id", sessionId);
        if (error) throw error;
      } else {
        const today = new Date().toISOString().split("T")[0];
        const { error } = await supabase
          .from("workout_sessions")
          .insert([{
            client_id: clientId,
            numero_dia: day,
            fecha: today,
            completed: true,
            completed_at: completedAt,
            final_comments: finalComments || null,
          }]);
        if (error) throw error;
      }
      setSessionCompleted(true);
      setShowFinish(false);
      setTimerRunning(false);
      fetchCompletedToday();
      toast.success("¡Sesión completada y guardada!");
    } catch (err) {
      toast.error("Error al finalizar sesión: " + err.message);
    } finally {
      setSavingFinish(false);
    }
  };

  const currentExercise = exercises[currentExIdx];
  const currentRawType = currentExercise?.catalogo_ejercicios?.tipo || "Otros";
  const currentBlockType = typeMapping[currentRawType] || "Otros";

  const started = phase === "started";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white pb-28 select-none">
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/60 px-3 py-2.5 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <BackButton label="Atrás" to="/client-dashboard" />

          <div className="flex items-center gap-2">
            {/* Toggle Modo Vista (Swipe vs List) */}
            {exercises.length > 0 && (
              <button
                onClick={() => setViewMode((m) => (m === "swipe" ? "list" : "swipe"))}
                className="flex items-center gap-1 bg-gray-800 px-2.5 py-1.5 rounded-xl border border-gray-700 text-xs font-bold text-gray-200 hover:text-white transition cursor-pointer active:scale-95"
                title={viewMode === "swipe" ? "Cambiar a modo lista" : "Cambiar a modo deslizar"}
              >
                {viewMode === "swipe" ? (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Lista</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Deslizar</span>
                  </>
                )}
              </button>
            )}

            {/* Live Timer */}
            <div className="flex items-center gap-1 bg-gray-800/90 px-2.5 py-1.5 rounded-xl border border-gray-700/60">
              <Timer className="w-3.5 h-3.5 text-blue-400" />
              <ElapsedTimer running={timerRunning} />
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="p-2 rounded-xl bg-gray-800/90 border border-gray-700/60 text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>

            {/* Pause/Play Button */}
            {started && (
              <button
                onClick={() => setTimerRunning((r) => !r)}
                className="p-2 rounded-xl bg-blue-600 border border-blue-500/60 text-white hover:bg-blue-500 transition cursor-pointer active:scale-95"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {started && (
          <div className="max-w-md mx-auto mt-2">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                animate={{ width: `${donePct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1 px-1">
              <span>{completedExercises.size} de {totalExercises} ejercicios</span>
              <span>{Math.round(donePct)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Container - Focused on Mobile Viewport */}
      <div className="max-w-md mx-auto px-3.5 py-4 space-y-4">
        {/* Title Banner */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 flex items-center justify-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-400" />
            Entrenamiento en Vivo
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {viewMode === "swipe" ? "Desliza horizontalmente entre ejercicios" : "Tu rutina diaria y registro en tiempo real"}
          </p>
        </div>

        {/* Day Selector Tabs (Mobile Friendly) */}
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: trainingDays }, (_, i) => i + 1).map((d) => {
            const isCompleted = completedTodaySet.has(d);
            const name = dayNames[d];
            return (
              <div key={d} className="relative">
                <button
                  onClick={() => setDay(d)}
                  className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1 ${
                    d === day
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105"
                      : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span>Día {d}</span>
                  {name && <span className="opacity-80 font-normal">· {name}</span>}
                </button>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow">
                    <CheckCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Banner Sesión Completada hoy */}
        {sessionCompleted && (
          <div className="flex items-center justify-center gap-2 bg-green-950/40 border border-green-500/40 rounded-2xl px-4 py-2.5">
            <CheckCheck className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-bold text-xs">
              Sesión del Día {day} completada hoy
            </span>
          </div>
        )}

        {/* Rest Config Bar */}
        <div className="flex items-center justify-between bg-gray-800/80 border border-gray-700/60 rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-gray-200">Descanso por defecto</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestTime((t) => Math.max(10, t - 10))}
              className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-black transition cursor-pointer active:scale-95"
            >−</button>
            <span className="text-blue-300 font-black w-10 text-center text-sm">{restTime}s</span>
            <button
              onClick={() => setRestTime((t) => Math.min(300, t + 10))}
              className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-black transition cursor-pointer active:scale-95"
            >+</button>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando ejercicios...</div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-800/40 rounded-2xl border border-gray-700/40">
            <Dumbbell className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-semibold">No hay ejercicios para el Día {day}</p>
          </div>
        ) : phase === "idle" ? (
          /* ── IDLE MODE: Botón Empezar + Selector Modo Vista ── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase("test")}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-950/50 transition cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-current" />
              ¡Empezar Entrenamiento Día {day}!
            </motion.button>

            {/* Sub-selector de vista */}
            <div className="flex justify-between items-center text-xs text-gray-400 font-bold px-1">
              <span>{exercises.length} Ejercicios en el Día {day}</span>
              <div className="flex gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setViewMode("swipe")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === "swipe" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                >
                  Deslizar ↔
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                >
                  Lista ☰
                </button>
              </div>
            </div>

            {/* VISTA DESLIZAR (SWIPE) */}
            {viewMode === "swipe" && currentExercise && (
              <div className="space-y-3">
                {/* Comentario del entrenador para este bloque */}
                {comments[currentBlockType] && (
                  <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nota del entrenador ({currentBlockType}):</span>
                    </div>
                    <p className="text-gray-300 text-xs italic">{comments[currentBlockType]}</p>
                  </div>
                )}

                {/* SWIPE CARD CON GESTO TÁCTIL */}
                <motion.div
                  key={currentExercise.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    const swipeThreshold = 50;
                    if (offset.x < -swipeThreshold && currentExIdx < totalExercises - 1) {
                      setCurrentExIdx((prev) => prev + 1);
                    } else if (offset.x > swipeThreshold && currentExIdx > 0) {
                      setCurrentExIdx((prev) => prev - 1);
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="touch-pan-y"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 px-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      {currentBlockType}
                    </span>
                    <span>{currentExIdx + 1} de {totalExercises}</span>
                  </div>

                  <ExerciseCard
                    ex={currentExercise}
                    restTime={restTime}
                    onSetComplete={handleSetComplete}
                    soundEnabled={soundEnabled}
                    onOpenImage={(img) => setSelectedImage(img)}
                  />
                </motion.div>

                {/* BARRA DE NAVEGACIÓN TÁCTIL FIJA ABAJO */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setCurrentExIdx((i) => Math.max(0, i - 1))}
                    disabled={currentExIdx === 0}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <span className="text-xs font-bold text-gray-400 px-2">
                    👈 Desliza 👉
                  </span>
                  <button
                    onClick={() => setCurrentExIdx((i) => Math.min(totalExercises - 1, i + 1))}
                    disabled={currentExIdx === totalExercises - 1}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-md shadow-blue-950/50"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* VISTA LISTA COMPLETA */}
            {viewMode === "list" && (
              <div className="space-y-6">
                {typeOrder.map((type) => {
                  if (!grouped[type]) return null;
                  const exList = grouped[type];
                  const Icon = typeIcons[type];
                  const col = typeColors[type];

                  return (
                    <div key={type} className="space-y-3">
                      <div className={`flex items-center gap-2 p-2.5 rounded-xl border-l-4 ${col.split(" ")[0]} bg-gray-800/80`}>
                        <Icon className={`w-4 h-4 ${col.split(" ")[1]}`} />
                        <h3 className={`font-bold text-sm ${col.split(" ")[1]}`}>{type}</h3>
                        <span className="ml-auto text-xs text-gray-400 font-semibold">{exList.length} ej.</span>
                      </div>

                      {comments[type] && (
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/60">
                          <p className="text-gray-300 text-xs italic">{comments[type]}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {exList.map((ex) => (
                          <ExerciseCard
                            key={ex.id}
                            ex={ex}
                            restTime={restTime}
                            onSetComplete={handleSetComplete}
                            soundEnabled={soundEnabled}
                            onOpenImage={(img) => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : phase === "test" ? (
          /* ── TEST PREVIO MODE ── */
          <TestPrevio onSubmit={handleTestSubmit} />
        ) : (
          /* ── LIVE WORKOUT MODE (MODO EN VIVO) ── */
          <div className="space-y-4">
            {/* Sub-selector de vista */}
            <div className="flex justify-between items-center text-xs text-gray-400 font-bold px-1">
              <span>Modo Entrenamiento Activo</span>
              <div className="flex gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setViewMode("swipe")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === "swipe" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                >
                  Deslizar ↔
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                >
                  Lista ☰
                </button>
              </div>
            </div>

            {/* MODO DESLIZAR EN VIVO */}
            {viewMode === "swipe" && currentExercise && (
              <div className="space-y-3">
                {comments[currentBlockType] && (
                  <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nota del entrenador ({currentBlockType}):</span>
                    </div>
                    <p className="text-gray-300 text-xs italic">{comments[currentBlockType]}</p>
                  </div>
                )}

                <motion.div
                  key={currentExercise.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    const swipeThreshold = 50;
                    if (offset.x < -swipeThreshold && currentExIdx < totalExercises - 1) {
                      setCurrentExIdx((prev) => prev + 1);
                    } else if (offset.x > swipeThreshold && currentExIdx > 0) {
                      setCurrentExIdx((prev) => prev - 1);
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="touch-pan-y"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 px-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      {currentBlockType}
                    </span>
                    <span>{currentExIdx + 1} de {totalExercises}</span>
                  </div>

                  <ExerciseCard
                    ex={currentExercise}
                    restTime={restTime}
                    onSetComplete={handleSetComplete}
                    soundEnabled={soundEnabled}
                    onOpenImage={(img) => setSelectedImage(img)}
                  />
                </motion.div>

                {/* BOTONES DE NAVEGACIÓN Y FINALIZAR */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setCurrentExIdx((i) => Math.max(0, i - 1))}
                    disabled={currentExIdx === 0}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentExIdx((i) => Math.min(totalExercises - 1, i + 1))}
                    disabled={currentExIdx === totalExercises - 1}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 shadow-md shadow-blue-950/50"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* MODO LISTA EN VIVO */}
            {viewMode === "list" && (
              <div className="space-y-6">
                {typeOrder.map((type) => {
                  if (!grouped[type]) return null;
                  const exList = grouped[type];
                  const Icon = typeIcons[type];
                  const col = typeColors[type];

                  return (
                    <div key={type} className="space-y-3">
                      <div className={`flex items-center gap-2 p-2.5 rounded-xl border-l-4 ${col.split(" ")[0]} bg-gray-800/80`}>
                        <Icon className={`w-4 h-4 ${col.split(" ")[1]}`} />
                        <h2 className={`font-bold text-sm ${col.split(" ")[1]}`}>{type}</h2>
                        <span className="ml-auto text-xs text-gray-400 font-semibold">
                          {exList.filter((ex) => completedExercises.has(ex.id)).length}/{exList.length}
                        </span>
                      </div>

                      {comments[type] && (
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/60">
                          <p className="text-gray-300 text-xs italic">{comments[type]}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {exList.map((ex) => (
                          <ExerciseCard
                            key={ex.id}
                            ex={ex}
                            restTime={restTime}
                            onSetComplete={handleSetComplete}
                            soundEnabled={soundEnabled}
                            onOpenImage={(img) => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botón Finalizar Sesión siempre disponible al final */}
            {!sessionCompleted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFinish(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-black text-white text-base transition shadow-lg shadow-green-950/50 cursor-pointer active:scale-98"
              >
                <CheckCheck className="w-5 h-5" />
                Finalizar sesión y guardar
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Finish Session Modal */}
      <AnimatePresence>
        {showFinish && (
          <FinishModal
            day={day}
            onClose={() => setShowFinish(false)}
            onConfirm={handleFinishConfirm}
            saving={savingFinish}
          />
        )}
      </AnimatePresence>

      {/* Exercise Image Fullscreen Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              key="image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                className="relative max-h-[90vh] max-w-[90vw] rounded-2xl overflow-hidden border border-gray-700/80 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 bg-gray-900/80 text-white rounded-full p-2 border border-gray-700 z-10 cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={selectedImage}
                  alt="Ejercicio"
                  className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}