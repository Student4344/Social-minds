import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, RotateCcw, Palette, Zap, Heart, Puzzle, Star, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ---- XP reward helper ----
const useXpReward = () => {
  const { user } = useAuth();
  const awardXp = async (amount: number) => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("xp, level").eq("user_id", user.id).single();
    if (!data) return;
    const newXp = data.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    await supabase.from("profiles").update({ xp: newXp, level: newLevel }).eq("user_id", user.id);
  };
  return awardXp;
};

const XpPopup = ({ amount }: { amount: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0 }}
    className="flex items-center gap-1 text-accent font-display font-bold text-sm">
    <Star size={14} className="text-accent" /> +{amount} XP
  </motion.div>
);

// ---- Find the Same (Color Memory) ----
const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#ec4899", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];

interface Card { id: number; color: string; flipped: boolean; matched: boolean; }

const FindTheSame = ({ onXp }: { onXp: (n: number) => void }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<4 | 6 | 8>(4);
  const awardXp = useXpReward();

  const initGame = useCallback(() => {
    const colorSet = COLORS.slice(0, (difficulty * difficulty) / 2);
    const pairs = [...colorSet, ...colorSet]
      .sort(() => Math.random() - 0.5)
      .map((color, i) => ({ id: i, color, flipped: false, matched: false }));
    setCards(pairs);
    setFlipped([]);
    setMoves(0);
    setWon(false);
  }, [difficulty]);

  useEffect(() => { initGame(); }, [initGame]);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].matched || cards[id].flipped) return;
    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].color === newCards[b].color) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c));
            if (updated.every((c) => c.matched)) {
              setWon(true);
              const xpAmount = difficulty === 4 ? 10 : difficulty === 6 ? 20 : 35;
              awardXp(xpAmount);
              onXp(xpAmount);
            }
            return updated;
          });
          setFlipped([]);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Moves: {moves}</span>
        <div className="flex gap-1">
          {([4, 6, 8] as const).map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`text-xs px-2 py-1 rounded-lg ${difficulty === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {d}x{d === 4 ? 4 : d === 6 ? 6 : 4}
            </button>
          ))}
        </div>
        <button onClick={initGame} className="text-primary flex items-center gap-1 text-sm">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      <div className={`grid gap-2 ${difficulty === 4 ? "grid-cols-4" : difficulty === 6 ? "grid-cols-6" : "grid-cols-8"}`}>
        {cards.map((card) => (
          <motion.button key={card.id} whileTap={{ scale: 0.95 }} onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-xl transition-all duration-300 ${
              card.flipped || card.matched ? "" : "bg-muted border border-border"
            } ${card.matched ? "opacity-40" : ""}`}
            style={{
              backgroundColor: card.flipped || card.matched ? card.color : undefined,
              boxShadow: card.flipped ? `0 0 15px ${card.color}40` : undefined,
            }} />
        ))}
      </div>
      {won && (
        <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center font-display font-bold text-neon-green neon-text">
          🎉 You won in {moves} moves!
        </motion.p>
      )}
    </div>
  );
};

// ---- Speed Tap ----
const TapGame = ({ onXp }: { onXp: (n: number) => void }) => {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [active, setActive] = useState(false);
  const [best, setBest] = useState(0);
  const awardXp = useXpReward();

  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && active) {
      setActive(false);
      if (count > best) setBest(count);
      const xp = Math.min(Math.floor(count / 5), 15);
      if (xp > 0) { awardXp(xp); onXp(xp); }
    }
  }, [timeLeft, active, count, best]);

  const reset = () => { setCount(0); setTimeLeft(10); setActive(false); };

  return (
    <div className="space-y-4 text-center">
      <p className="text-muted-foreground text-sm">
        {timeLeft > 0 ? `⏱ ${timeLeft}s` : "Time's up!"}
      </p>
      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { if (!active && timeLeft > 0) setActive(true); if (active) setCount((c) => c + 1); }}
        className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/30 flex items-center justify-center neon-glow">
        <span className="font-display text-3xl font-bold text-foreground">{count}</span>
      </motion.button>
      <p className="text-xs text-muted-foreground">Best: {best} taps</p>
      {timeLeft === 0 && (
        <button onClick={reset} className="text-primary text-sm flex items-center gap-1 mx-auto">
          <RotateCcw size={14} /> Play Again
        </button>
      )}
    </div>
  );
};

// ---- Emotion Word Unscramble ----
const EMOTION_WORDS = [
  { word: "HAPPINESS", hint: "😊 A feeling of joy and contentment" },
  { word: "GRATITUDE", hint: "🙏 Thankfulness and appreciation" },
  { word: "SERENITY", hint: "🧘 A state of calm and peace" },
  { word: "COURAGE", hint: "🦁 Bravery in facing fears" },
  { word: "EMPATHY", hint: "💛 Understanding others' feelings" },
  { word: "RESILIENCE", hint: "💪 Bouncing back from hardship" },
  { word: "KINDNESS", hint: "🌸 Being warm and generous" },
  { word: "HOPE", hint: "🌈 Belief in positive outcomes" },
];

const WordUnscramble = ({ onXp }: { onXp: (n: number) => void }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [solved, setSolved] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const awardXp = useXpReward();

  const current = EMOTION_WORDS[wordIndex];
  const scrambled = current.word.split("").sort(() => Math.random() - 0.5).join("");

  const handleGuess = () => {
    if (guess.toUpperCase() === current.word) {
      setSolved((s) => s + 1);
      awardXp(5);
      onXp(5);
      setGuess("");
      setShowHint(false);
      setWordIndex((i) => (i + 1) % EMOTION_WORDS.length);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-muted-foreground text-sm">Unscramble the positive emotion word</p>
      <p className="font-display text-2xl font-bold text-primary tracking-widest neon-text">{scrambled}</p>
      {showHint && <p className="text-xs text-muted-foreground">{current.hint}</p>}
      <input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        placeholder="Type your answer..."
        className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center" />
      <div className="flex gap-2 justify-center">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleGuess}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-display font-bold text-sm">Check</motion.button>
        <button onClick={() => setShowHint(true)} className="text-muted-foreground text-sm">Hint</button>
      </div>
      <p className="text-xs text-muted-foreground">Solved: {solved} words</p>
    </div>
  );
};

// ---- Gratitude Jar ----
const GratitudeJar = ({ onXp }: { onXp: (n: number) => void }) => {
  const [gratitudes, setGratitudes] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const awardXp = useXpReward();

  const addGratitude = () => {
    if (!input.trim()) return;
    setGratitudes((prev) => [input.trim(), ...prev]);
    setInput("");
    if (gratitudes.length % 3 === 2) { awardXp(5); onXp(5); }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm text-center">Write things you're grateful for. Every 3 entries = XP!</p>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGratitude()}
          placeholder="I'm grateful for..."
          className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <motion.button whileTap={{ scale: 0.95 }} onClick={addGratitude}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm">+</motion.button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {gratitudes.map((g, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground flex items-start gap-2">
            <span>✨</span> {g}
          </motion.div>
        ))}
        {gratitudes.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Your jar is empty. Start filling it!</p>}
      </div>
    </div>
  );
};

// ---- Pattern Sequence (memory + focus) ----
const PatternSequence = ({ onXp }: { onXp: (n: number) => void }) => {
  const colors = ["bg-primary", "bg-neon-cyan", "bg-neon-pink", "bg-neon-green"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const awardXp = useXpReward();

  const startGame = useCallback(() => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setPlayerSeq([]);
    setScore(0);
    setGameOver(false);
    showSequence(first);
  }, []);

  const showSequence = (seq: number[]) => {
    setShowing(true);
    seq.forEach((idx, i) => {
      setTimeout(() => setActiveIdx(idx), i * 600);
      setTimeout(() => setActiveIdx(null), i * 600 + 400);
    });
    setTimeout(() => setShowing(false), seq.length * 600 + 200);
  };

  const handlePress = (idx: number) => {
    if (showing || gameOver) return;
    const newPlayerSeq = [...playerSeq, idx];
    setPlayerSeq(newPlayerSeq);
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 200);

    const currentPos = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentPos] !== sequence[currentPos]) {
      setGameOver(true);
      const xp = Math.max(score * 3, 0);
      if (xp > 0) { awardXp(xp); onXp(xp); }
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setScore((s) => s + 1);
      const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(nextSeq);
      setPlayerSeq([]);
      setTimeout(() => showSequence(nextSeq), 800);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-muted-foreground text-sm">Watch the pattern, then repeat it!</p>
      <div className="grid grid-cols-2 gap-3 w-48 mx-auto">
        {colors.map((color, i) => (
          <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => handlePress(i)}
            className={`aspect-square rounded-2xl ${color} transition-all duration-200 ${
              activeIdx === i ? "opacity-100 scale-105 shadow-lg" : "opacity-40"
            }`} />
        ))}
      </div>
      <p className="font-display font-bold text-foreground">Score: {score}</p>
      {!sequence.length && !gameOver && (
        <motion.button whileTap={{ scale: 0.95 }} onClick={startGame}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-display font-bold text-sm neon-glow">
          Start Game
        </motion.button>
      )}
      {gameOver && (
        <div className="space-y-2">
          <p className="text-neon-pink font-bold">Game Over! Score: {score}</p>
          <button onClick={startGame} className="text-primary text-sm flex items-center gap-1 mx-auto">
            <RotateCcw size={14} /> Play Again
          </button>
        </div>
      )}
      {showing && <p className="text-xs text-accent animate-pulse">Watch closely...</p>}
    </div>
  );
};

// ---- Main Games Page ----
const games = [
  { id: "memory", icon: Palette, title: "Find the Same", desc: "Match color pairs to train focus & memory", color: "bg-primary/15", xp: "10-35" },
  { id: "tap", icon: Zap, title: "Speed Tap", desc: "Release energy — tap as fast as you can!", color: "bg-neon-cyan/15", xp: "1-15" },
  { id: "unscramble", icon: Puzzle, title: "Emotion Words", desc: "Unscramble positive emotion vocabulary", color: "bg-neon-pink/15", xp: "5" },
  { id: "gratitude", icon: Heart, title: "Gratitude Jar", desc: "Fill your jar with things you're grateful for", color: "bg-neon-green/15", xp: "5" },
  { id: "pattern", icon: Trophy, title: "Pattern Memory", desc: "Remember and repeat the light sequence", color: "bg-accent/15", xp: "3×score" },
];

const GamesPage = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const handleXp = (amount: number) => setXpGained((p) => p + amount);

  const renderGame = () => {
    switch (activeGame) {
      case "memory": return <FindTheSame onXp={handleXp} />;
      case "tap": return <TapGame onXp={handleXp} />;
      case "unscramble": return <WordUnscramble onXp={handleXp} />;
      case "gratitude": return <GratitudeJar onXp={handleXp} />;
      case "pattern": return <PatternSequence onXp={handleXp} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">Games</h1>
          <p className="text-muted-foreground text-sm mt-1">Relax & destress through play</p>
        </div>

        {!activeGame ? (
          <div className="space-y-3">
            {games.map((game) => (
              <motion.button key={game.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveGame(game.id); setXpGained(0); }}
                className={`w-full ${game.color} border border-border rounded-2xl p-5 flex items-center gap-4 text-left`}>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <game.icon size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{game.title}</h3>
                  <p className="text-xs text-muted-foreground">{game.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent font-bold">
                  <Star size={12} /> {game.xp}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">
                {games.find((g) => g.id === activeGame)?.title}
              </h3>
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {xpGained > 0 && <XpPopup amount={xpGained} />}
                </AnimatePresence>
                <button onClick={() => setActiveGame(null)} className="text-muted-foreground text-sm hover:text-foreground">
                  ← Back
                </button>
              </div>
            </div>
            {renderGame()}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GamesPage;