import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import MoodSlider from "@/components/MoodSlider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { startOfWeek, addDays, format, isToday } from "date-fns";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MoodPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState(4);
  const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const maxMood = 7;

  const fetchWeekData = useCallback(async () => {
    if (!user) return;
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const sunday = addDays(monday, 6);

    const { data } = await supabase
      .from("mood_logs")
      .select("mood, created_at")
      .eq("user_id", user.id)
      .gte("created_at", monday.toISOString())
      .lte("created_at", addDays(sunday, 1).toISOString())
      .order("created_at", { ascending: false });

    const mapped = [0, 0, 0, 0, 0, 0, 0];
    if (data) {
      for (const entry of data) {
        const d = new Date(entry.created_at);
        const dayIdx = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
        if (mapped[dayIdx] === 0) mapped[dayIdx] = entry.mood;
      }
    }
    setWeekData(mapped);
  }, [user]);

  useEffect(() => { fetchWeekData(); }, [fetchWeekData]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("mood_logs").insert({ user_id: user.id, mood: currentMood });
    if (error) { toast.error("Failed to save mood"); return; }
    toast.success("Mood saved! 💜");
    await fetchWeekData();
  };

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">{t("mood.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("mood.subtitle")}</p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-foreground">{t("mood.today")}</h2>
          <MoodSlider initialValue={currentMood} onMoodChange={setCurrentMood} />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 neon-glow">
            <Save size={16} /> {t("mood.save")}
          </motion.button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold text-foreground mb-4">{t("mood.history")}</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {weekData.map((val, i) => {
              const dayDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
              const today = isToday(dayDate);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <motion.div
                    key={`bar-${i}-${val}`}
                    initial={{ height: 0 }}
                    animate={{ height: val > 0 ? `${(val / maxMood) * 100}%` : "4px" }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`w-full rounded-t-lg ${val >= 5 ? "bg-neon-cyan/50" : val >= 3 ? "bg-primary/50" : val > 0 ? "bg-neon-pink/50" : "bg-muted"}`}
                  />
                  <span className={`text-[10px] font-medium ${today ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {daysOfWeek[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodPage;
