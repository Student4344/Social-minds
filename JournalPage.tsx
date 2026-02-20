import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const JournalPage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: title.trim() || "Untitled",
      content: content.trim(),
    });
    if (error) { toast.error("Failed to save entry"); setSaving(false); return; }
    toast.success("Journal entry saved! 📝");
    setTitle("");
    setContent("");
    setSaving(false);
  };

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">Write your thoughts freely</p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked size={18} className="text-neon-cyan" />
            <span className="font-display font-bold text-sm text-foreground">New Entry</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your day? What's on your mind? Let it all out..."
            rows={8}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="w-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-neon-cyan/30 transition-colors"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Entry"}
          </motion.button>
        </div>

        {/* Prompts */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">💡 Writing Prompts</h3>
          <div className="space-y-2">
            {[
              "What are 3 things I'm grateful for today?",
              "What emotion am I feeling right now and why?",
              "What would I tell my best friend in this situation?",
              "What's one small win from today?",
            ].map((prompt, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 4 }}
                onClick={() => setContent((prev) => prev + (prev ? "\n\n" : "") + prompt + "\n")}
                className="w-full text-left text-xs text-muted-foreground hover:text-foreground bg-muted/50 rounded-lg px-3 py-2 transition-colors"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalPage;
