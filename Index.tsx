import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wind, MessageCircle, BarChart3, BookOpen, Brain, Gamepad2, BookMarked, LogOut } from "lucide-react";
import QuickActionCard from "@/components/QuickActionCard";
import StatsBar from "@/components/StatsBar";
import MoodSlider from "@/components/MoodSlider";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend";

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 pt-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 neon-glow flex items-center justify-center">
              <Brain size={20} className="text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Social Bloom</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={signOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="font-display text-xl font-bold text-foreground">
            Hey {displayName} 👋
          </h2>
          <p className="text-muted-foreground text-sm">{t("home.greeting")}</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item}>
          <StatsBar streak={3} xp={120} level={2} />
        </motion.div>

        {/* Mood Check-in */}
        <motion.div variants={item} className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-bold text-foreground">{t("home.mood_check")}</h3>
          <MoodSlider />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="font-display font-bold text-foreground mb-3">{t("home.quick_actions")}</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard to="/chat" icon={MessageCircle} title={t("home.chat_title")} description={t("home.chat_desc")} color="purple" />
            <QuickActionCard to="/breathe" icon={Wind} title={t("home.breathe_title")} description={t("home.breathe_desc")} color="blue" />
            <QuickActionCard to="/journal" icon={BookMarked} title="Journal" description="Write your thoughts" color="cyan" />
            <QuickActionCard to="/mood" icon={BarChart3} title={t("home.mood_title")} description={t("home.mood_desc")} color="pink" />
            <QuickActionCard to="/games" icon={Gamepad2} title="Games" description="Stress-relief games" color="green" />
            <QuickActionCard to="/learn" icon={BookOpen} title={t("home.learn_title")} description={t("home.learn_desc")} color="orange" />
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={item}>
          <DisclaimerBanner />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
