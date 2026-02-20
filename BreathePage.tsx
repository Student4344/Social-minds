import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Play, Square, Wind, Eye, Hand, Brain, Heart } from "lucide-react";

const PHASE_DURATION = 4000;
const breathePhases = ["inhale", "hold", "exhale", "rest"] as const;

// ---- Box Breathing ----
const BoxBreathing = () => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const currentPhase = breathePhases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, PHASE_DURATION);
    return () => clearInterval(interval);
  }, [isActive]);

  const scale = currentPhase === "inhale" || currentPhase === "hold" ? 1.4 : 1;

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center py-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isActive ? scale : 1,
              boxShadow: isActive
                ? `0 0 ${scale * 30}px hsl(var(--primary) / 0.4), 0 0 ${scale * 60}px hsl(var(--secondary) / 0.2)`
                : "0 0 20px hsl(var(--primary) / 0.2)",
            }}
            transition={{ duration: PHASE_DURATION / 1000, ease: "easeInOut" }}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: isActive ? scale * 0.5 : 0.5 }}
              transition={{ duration: PHASE_DURATION / 1000, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-primary/30 backdrop-blur-sm"
            />
          </motion.div>
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.p key={currentPhase} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="absolute font-display font-bold text-foreground text-lg neon-text">
                {t(`breathe.${currentPhase}`)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => { setIsActive(!isActive); if (!isActive) { setCycles(0); setPhaseIndex(0); } }}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-display font-bold text-sm neon-glow flex items-center gap-2 mx-auto">
        {isActive ? <Square size={18} /> : <Play size={18} />}
        {isActive ? t("breathe.stop") : t("breathe.start")}
      </motion.button>
      {cycles > 0 && <p className="text-muted-foreground text-sm">{cycles} {t("breathe.cycles")}</p>}
    </div>
  );
};

// ---- 5-4-3-2-1 Grounding ----
const GroundingExercise = () => {
  const steps = [
    { count: 5, sense: "See", emoji: "👁️", prompt: "Name 5 things you can SEE around you", color: "from-primary/30 to-secondary/30" },
    { count: 4, sense: "Touch", emoji: "✋", prompt: "Name 4 things you can TOUCH", color: "from-neon-cyan/30 to-primary/30" },
    { count: 3, sense: "Hear", emoji: "👂", prompt: "Name 3 things you can HEAR", color: "from-neon-pink/30 to-primary/30" },
    { count: 2, sense: "Smell", emoji: "👃", prompt: "Name 2 things you can SMELL", color: "from-neon-green/30 to-primary/30" },
    { count: 1, sense: "Taste", emoji: "👅", prompt: "Name 1 thing you can TASTE", color: "from-accent/30 to-primary/30" },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else setDone(true);
  };

  const reset = () => { setCurrentStep(0); setDone(false); };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-8">
        <p className="text-4xl">🌟</p>
        <h3 className="font-display font-bold text-xl text-foreground neon-text">You're grounded!</h3>
        <p className="text-muted-foreground text-sm">Great job reconnecting with your senses.</p>
        <button onClick={reset} className="text-primary text-sm font-medium">Try Again</button>
      </motion.div>
    );
  }

  const step = steps[currentStep];
  return (
    <div className="space-y-6 text-center py-4">
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= currentStep ? "bg-primary neon-glow" : "bg-muted"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-4">
          <p className="text-5xl">{step.emoji}</p>
          <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-6 mx-auto max-w-xs`}>
            <p className="font-display font-bold text-3xl text-foreground">{step.count}</p>
            <p className="text-foreground/80 text-sm mt-2">{step.prompt}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.95 }} onClick={handleNext}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-display font-bold text-sm neon-glow">
        {currentStep < steps.length - 1 ? "Next →" : "Finish ✨"}
      </motion.button>
    </div>
  );
};

// ---- Body Scan ----
const BodyScan = () => {
  const bodyParts = [
    { name: "Head & Face", instruction: "Relax your forehead, jaw, and neck. Release any tension.", duration: 8 },
    { name: "Shoulders & Arms", instruction: "Let your shoulders drop. Feel heaviness in your arms and hands.", duration: 8 },
    { name: "Chest & Stomach", instruction: "Breathe deeply. Notice your chest rise and fall.", duration: 8 },
    { name: "Hips & Legs", instruction: "Relax your hips, thighs, and knees. Let go of tension.", duration: 8 },
    { name: "Feet & Toes", instruction: "Feel the ground beneath you. Wiggle your toes gently.", duration: 8 },
  ];
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (step >= bodyParts.length) { setActive(false); return; }
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t >= bodyParts[step].duration) {
          setStep((s) => s + 1);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, step]);

  const reset = () => { setActive(false); setStep(0); setTimer(0); };
  const progress = active && step < bodyParts.length ? (timer / bodyParts[step].duration) * 100 : 0;

  return (
    <div className="space-y-6 text-center py-4">
      {!active && step === 0 ? (
        <>
          <p className="text-muted-foreground text-sm">A guided relaxation scanning each part of your body.</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActive(true)}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-display font-bold text-sm neon-glow flex items-center gap-2 mx-auto">
            <Play size={18} /> Begin Scan
          </motion.button>
        </>
      ) : step >= bodyParts.length ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-4xl">🧘</p>
          <h3 className="font-display font-bold text-xl text-foreground neon-text">Scan Complete</h3>
          <p className="text-muted-foreground text-sm">Your body thanks you for the attention.</p>
          <button onClick={reset} className="text-primary text-sm font-medium">Restart</button>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-center gap-2">
            {bodyParts.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= step ? "bg-primary neon-glow" : "bg-muted"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <h3 className="font-display font-bold text-xl text-foreground">{bodyParts[step].name}</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">{bodyParts[step].instruction}</p>
              <div className="w-48 h-2 bg-muted rounded-full mx-auto overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          </AnimatePresence>
          <button onClick={reset} className="text-muted-foreground text-xs">Stop</button>
        </>
      )}
    </div>
  );
};

// ---- Progressive Muscle Relaxation ----
const MuscleRelaxation = () => {
  const muscles = [
    { name: "Fists", instruction: "Clench your fists tightly for 5 seconds... then release.", emoji: "✊" },
    { name: "Arms", instruction: "Flex your biceps hard for 5 seconds... then let go.", emoji: "💪" },
    { name: "Shoulders", instruction: "Shrug your shoulders up to your ears... hold... release.", emoji: "🤷" },
    { name: "Face", instruction: "Scrunch your face tightly... then relax completely.", emoji: "😣" },
    { name: "Stomach", instruction: "Tighten your abs... hold... release and breathe.", emoji: "🫁" },
    { name: "Legs", instruction: "Tense your thighs and calves... hold... let go.", emoji: "🦵" },
  ];
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"tense" | "release">("tense");
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      if (phase === "tense") {
        setPhase("release");
      } else {
        if (step < muscles.length - 1) {
          setStep((s) => s + 1);
          setPhase("tense");
        } else {
          setDone(true);
          setActive(false);
        }
      }
    }, phase === "tense" ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [active, phase, step]);

  const reset = () => { setStep(0); setPhase("tense"); setActive(false); setDone(false); };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-8">
        <p className="text-4xl">😌</p>
        <h3 className="font-display font-bold text-xl text-foreground neon-text">Fully Relaxed</h3>
        <p className="text-muted-foreground text-sm">Notice the difference between tension and relaxation.</p>
        <button onClick={reset} className="text-primary text-sm font-medium">Try Again</button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 text-center py-4">
      {!active ? (
        <>
          <p className="text-muted-foreground text-sm">Tense and release each muscle group to melt away stress.</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActive(true)}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-display font-bold text-sm neon-glow flex items-center gap-2 mx-auto">
            <Play size={18} /> Start
          </motion.button>
        </>
      ) : (
        <>
          <p className="text-5xl">{muscles[step].emoji}</p>
          <h3 className="font-display font-bold text-xl text-foreground">{muscles[step].name}</h3>
          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {phase === "tense" ? (
                <motion.p animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="text-accent font-bold text-lg">TENSE! 💥</motion.p>
              ) : (
                <motion.p className="text-neon-green font-bold text-lg neon-text">Release... 🍃</motion.p>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">{muscles[step].instruction}</p>
          <p className="text-xs text-muted-foreground">{step + 1} / {muscles.length}</p>
          <button onClick={reset} className="text-muted-foreground text-xs">Stop</button>
        </>
      )}
    </div>
  );
};

// ---- Main Exercises Page ----
const exercises = [
  { id: "breathing", icon: Wind, title: "Box Breathing", desc: "Calm your nervous system with 4-4-4-4 rhythm", color: "bg-primary/15" },
  { id: "grounding", icon: Eye, title: "5-4-3-2-1 Grounding", desc: "Reconnect with your senses to ease anxiety", color: "bg-neon-cyan/15" },
  { id: "bodyscan", icon: Heart, title: "Body Scan", desc: "Guided relaxation from head to toe", color: "bg-neon-pink/15" },
  { id: "pmr", icon: Hand, title: "Muscle Relaxation", desc: "Tense & release to melt away stress", color: "bg-neon-green/15" },
];

const BreathePage = () => {
  const { t } = useTranslation();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const renderExercise = () => {
    switch (activeExercise) {
      case "breathing": return <BoxBreathing />;
      case "grounding": return <GroundingExercise />;
      case "bodyscan": return <BodyScan />;
      case "pmr": return <MuscleRelaxation />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">{t("breathe.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("breathe.subtitle")}</p>
        </div>

        {!activeExercise ? (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <motion.button key={ex.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setActiveExercise(ex.id)}
                className={`w-full ${ex.color} border border-border rounded-2xl p-5 flex items-center gap-4 text-left`}>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <ex.icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{ex.title}</h3>
                  <p className="text-xs text-muted-foreground">{ex.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">
                {exercises.find((e) => e.id === activeExercise)?.title}
              </h3>
              <button onClick={() => setActiveExercise(null)} className="text-muted-foreground text-sm hover:text-foreground">
                ← Back
              </button>
            </div>
            {renderExercise()}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BreathePage;