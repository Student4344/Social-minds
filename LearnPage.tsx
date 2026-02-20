import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Heart, Shield, Clock, ArrowLeft, CheckCircle } from "lucide-react";

interface Module {
  icon: typeof Brain;
  title: string;
  duration: string;
  color: string;
  iconBg: string;
  content: {
    sections: { heading: string; body: string }[];
    takeaway: string;
  };
}

const modules: Module[] = [
  {
    icon: Brain, title: "Understanding Anxiety", duration: "5 min",
    color: "bg-primary/15 border-primary/20", iconBg: "bg-primary/25 text-primary",
    content: {
      sections: [
        { heading: "What is Anxiety?", body: "Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While it's normal to feel anxious sometimes, persistent anxiety can interfere with daily life." },
        { heading: "The Fight-or-Flight Response", body: "When you feel threatened, your brain triggers the fight-or-flight response. Your heart races, breathing quickens, and muscles tense. This was useful for our ancestors facing physical dangers, but today it can be triggered by work deadlines or social situations." },
        { heading: "Common Signs", body: "• Racing thoughts or constant worry\n• Difficulty concentrating\n• Muscle tension and headaches\n• Sleep problems\n• Irritability\n• Stomach issues" },
        { heading: "Coping Strategies", body: "1. Practice deep breathing (try our Box Breathing exercise!)\n2. Challenge negative thoughts — ask 'Is this thought based on facts?'\n3. Break tasks into smaller steps\n4. Limit caffeine and alcohol\n5. Regular exercise, even a 10-minute walk helps" },
      ],
      takeaway: "Anxiety is manageable. Understanding your triggers is the first step to taking control."
    }
  },
  {
    icon: Zap, title: "Dopamine & Your Brain", duration: "4 min",
    color: "bg-neon-cyan/10 border-neon-cyan/15", iconBg: "bg-neon-cyan/20 text-neon-cyan",
    content: {
      sections: [
        { heading: "The Reward Chemical", body: "Dopamine is a neurotransmitter that plays a major role in motivation, reward, and pleasure. It's released when you eat food you enjoy, exercise, or accomplish something meaningful." },
        { heading: "The Dopamine Trap", body: "Social media, video games, and junk food provide quick dopamine hits. Over time, your brain needs more stimulation to feel the same pleasure — this is called dopamine desensitization." },
        { heading: "Healthy Dopamine Habits", body: "• Complete small tasks and celebrate wins\n• Exercise regularly (even 20 minutes)\n• Listen to music you love\n• Practice gratitude (try our Gratitude Jar game!)\n• Get sunlight in the morning\n• Try something creative" },
        { heading: "The Dopamine Detox", body: "Try reducing high-stimulation activities for a day. No social media, no gaming, no junk food. You'll notice everyday activities become more enjoyable when your dopamine baseline resets." },
      ],
      takeaway: "Balance is key. Build habits that provide sustainable dopamine, not just quick hits."
    }
  },
  {
    icon: Heart, title: "Emotional Regulation 101", duration: "6 min",
    color: "bg-neon-pink/10 border-neon-pink/15", iconBg: "bg-neon-pink/20 text-neon-pink",
    content: {
      sections: [
        { heading: "What is Emotional Regulation?", body: "It's the ability to manage and respond to emotional experiences in a healthy way. It doesn't mean suppressing emotions — it means understanding and directing them." },
        { heading: "The Emotion Wheel", body: "Basic emotions (anger, sadness, fear, joy, surprise, disgust) branch into more specific ones. 'I feel bad' might actually be disappointment, frustration, or loneliness. Naming the exact emotion helps you process it." },
        { heading: "The RAIN Technique", body: "R — Recognize: Notice what you're feeling\nA — Allow: Let the emotion exist without judgment\nI — Investigate: Where do you feel it in your body?\nN — Non-identification: You are not your emotions; they're temporary visitors" },
        { heading: "When Emotions Overwhelm", body: "• Use the 5-4-3-2-1 grounding technique (available in Exercises!)\n• Take a cold shower or splash cold water on your face\n• Move your body — jump, stretch, walk\n• Write it down in your journal\n• Talk to someone you trust" },
      ],
      takeaway: "Emotions are information, not instructions. Learn to listen to them without being controlled by them."
    }
  },
  {
    icon: Shield, title: "Breaking Addiction Cycles", duration: "7 min",
    color: "bg-secondary/15 border-secondary/20", iconBg: "bg-secondary/25 text-secondary",
    content: {
      sections: [
        { heading: "Understanding Addiction", body: "Addiction is a complex condition where the brain becomes dependent on a substance or behavior for reward. It hijacks your brain's reward system, making you crave the substance or behavior despite negative consequences." },
        { heading: "The Cycle", body: "Trigger → Craving → Use → Temporary Relief → Guilt/Shame → Trigger\n\nBreaking free means interrupting this cycle at any point. The earlier you intervene, the easier it is." },
        { heading: "Urge Surfing", body: "When a craving hits, imagine it as a wave. It rises, peaks, and then falls — usually within 15-30 minutes. Instead of fighting it:\n1. Notice the urge\n2. Breathe through it\n3. Observe it without acting\n4. Let it pass naturally" },
        { heading: "Building New Patterns", body: "• Identify your triggers (time, place, emotion, people)\n• Replace the behavior with something healthier\n• Build a support network\n• Celebrate small wins — each day matters\n• Be kind to yourself if you slip — it's part of recovery" },
      ],
      takeaway: "Recovery is not linear. Every moment of resistance builds your strength. You are stronger than your cravings."
    }
  },
  {
    icon: Brain, title: "Overthinking: Why & How", duration: "5 min",
    color: "bg-neon-green/10 border-neon-green/15", iconBg: "bg-neon-green/20 text-neon-green",
    content: {
      sections: [
        { heading: "Why We Overthink", body: "Overthinking is your brain's attempt to control uncertain situations. It feels productive but actually keeps you stuck. Common triggers include fear of failure, perfectionism, and past experiences." },
        { heading: "Rumination vs Problem-Solving", body: "Problem-solving moves you forward: 'What can I do about this?'\nRumination keeps you stuck: 'Why did this happen to me?'\n\nIf you've been thinking about the same thing for more than 10 minutes without a new insight, you're ruminating." },
        { heading: "The 5-Minute Rule", body: "Give yourself exactly 5 minutes to worry about something. Set a timer. Think about it deeply. When the timer goes off, move on to an activity. This trains your brain that worry has a beginning and an end." },
        { heading: "Techniques to Stop", body: "• Write your thoughts down — getting them out of your head helps\n• Ask: 'Will this matter in 5 years?'\n• Practice mindfulness (try our Body Scan exercise!)\n• Set 'worry time' — schedule 15 min/day for worrying\n• Challenge each thought: 'Is this fact or opinion?'" },
      ],
      takeaway: "Your thoughts are not facts. You can observe them without believing every one."
    }
  },
  {
    icon: Heart, title: "Building Self-Compassion", duration: "4 min",
    color: "bg-accent/15 border-accent/20", iconBg: "bg-accent/25 text-accent",
    content: {
      sections: [
        { heading: "What is Self-Compassion?", body: "Self-compassion means treating yourself with the same kindness you'd offer a good friend. It's not self-pity or self-indulgence — it's recognizing that suffering and imperfection are part of being human." },
        { heading: "The Three Components", body: "1. Self-Kindness: Be warm to yourself instead of harshly critical\n2. Common Humanity: Remember that everyone struggles — you're not alone\n3. Mindfulness: Observe your pain without exaggerating it" },
        { heading: "The Self-Compassion Break", body: "When you're suffering, say to yourself:\n1. 'This is a moment of suffering' (mindfulness)\n2. 'Suffering is part of life' (common humanity)\n3. 'May I be kind to myself' (self-kindness)\n\nPlace your hand on your heart as you say these words." },
        { heading: "Daily Practice", body: "• Write yourself a letter from a compassionate friend's perspective\n• Replace 'I should' with 'I could'\n• Celebrate effort, not just results\n• Forgive yourself for mistakes — they're learning opportunities\n• Use our Gratitude Jar to appreciate yourself" },
      ],
      takeaway: "You deserve the same compassion you give to others. Start today."
    }
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const LearnPage = () => {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setCompletedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (activeModule !== null) {
    const mod = modules[activeModule];
    return (
      <div className="min-h-screen mesh-gradient pb-24">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          className="max-w-lg mx-auto px-4 pt-8 space-y-6">
          <button onClick={() => setActiveModule(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft size={16} /> Back to modules
          </button>
          <div className="flex items-center gap-3">
            <div className={`${mod.iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
              <mod.icon size={22} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">{mod.title}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={12} /><span className="text-xs">{mod.duration} read</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mod.content.sections.map((sec, i) => {
              const key = `${activeModule}-${i}`;
              const done = completedSections.has(key);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-bold text-foreground">{sec.heading}</h3>
                    <button onClick={() => toggleSection(key)}
                      className={`shrink-0 ${done ? "text-neon-green" : "text-muted-foreground/30"}`}>
                      <CheckCircle size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{sec.body}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="glass-card rounded-2xl p-5 border-2 border-accent/20 bg-accent/5">
            <p className="text-xs text-accent font-bold uppercase mb-1">💡 Key Takeaway</p>
            <p className="text-sm text-foreground font-medium">{mod.content.takeaway}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <motion.div variants={item} className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">Learn</h1>
          <p className="text-muted-foreground text-sm mt-1">Mental Health Mini-Lessons</p>
        </motion.div>
        <div className="space-y-3">
          {modules.map((mod, i) => (
            <motion.button key={i} variants={item} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModule(i)}
              className={`w-full ${mod.color} border rounded-2xl p-4 flex items-center gap-4 text-left`}>
              <div className={`${mod.iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                <mod.icon size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-sm text-foreground">{mod.title}</h3>
                <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                  <Clock size={12} /><span className="text-xs">{mod.duration}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LearnPage;