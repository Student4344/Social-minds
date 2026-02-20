import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3, Star, Trophy, Shield, Award, Zap, Heart, Brain, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TITLES = [
  "Mind Explorer", "Zen Warrior", "Mood Master", "Breath Keeper",
  "Soul Seeker", "Inner Champion", "Peace Advocate", "Calm Commander",
  "Joy Finder", "Resilience King",
];

const BADGE_ICONS: Record<string, typeof Star> = {
  "First Login": Star, "7-Day Streak": Trophy, "Mind Explorer": Brain,
  "Game Champion": Zap, "Journal Writer": Edit3, "Gratitude Guru": Heart,
};

const BANNER_COLORS: Record<number, string> = {
  1: "from-primary/40 to-secondary/40",
  2: "from-neon-cyan/40 to-primary/40",
  3: "from-neon-pink/40 to-neon-cyan/40",
  5: "from-accent/40 to-neon-green/40",
  10: "from-accent/60 to-neon-pink/60",
};

const getBanner = (level: number) => {
  const keys = Object.keys(BANNER_COLORS).map(Number).sort((a, b) => b - a);
  for (const k of keys) { if (level >= k) return BANNER_COLORS[k]; }
  return BANNER_COLORS[1];
};

const ProfilePage = () => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("Mind Explorer");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setUsername(data.username || data.display_name || "");
          setBio(data.bio || "");
          setTitle(data.title || "Mind Explorer");
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    // Check unique username
    if (username !== profile.username) {
      const { data: existing } = await supabase.from("profiles")
        .select("id").eq("username", username).neq("user_id", user.id).single();
      if (existing) { toast.error("Username already taken!"); return; }
    }
    await supabase.from("profiles").update({ username, bio, title, display_name: username }).eq("user_id", user.id);
    setProfile({ ...profile, username, bio, title, display_name: username });
    setEditing(false);
    toast.success("Profile updated! ✨");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    setProfile({ ...profile, avatar_url: publicUrl });
    setUploading(false);
    toast.success("Avatar updated!");
  };

  if (!profile) return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const badges = profile.badges || ["First Login"];
  const banner = getBanner(profile.level || 1);

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <div className="max-w-lg mx-auto">
        {/* Banner */}
        <div className={`h-32 bg-gradient-to-r ${banner} relative`}>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/40 backdrop-blur-sm rounded-full px-3 py-1">
            <Crown size={14} className="text-accent" />
            <span className="text-xs font-bold text-foreground">Lv.{profile.level}</span>
          </div>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-14 relative z-10">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-muted neon-glow">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Brain size={32} className="text-primary" />
                  </div>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg">
                <Camera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 pb-1">
              <h2 className="font-display font-bold text-xl text-foreground">{profile.display_name || "User"}</h2>
              <p className="text-xs text-accent font-bold">{profile.title || "Mind Explorer"}</p>
            </div>
            <button onClick={() => setEditing(!editing)}
              className="mb-1 px-3 py-1.5 bg-primary/20 text-primary rounded-xl text-xs font-bold">
              <Edit3 size={12} className="inline mr-1" />{editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* Stats bar */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-around">
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">{profile.xp}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">{profile.level}</p>
              <p className="text-[10px] text-muted-foreground">Level</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">{profile.streak}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">{badges.length}</p>
              <p className="text-[10px] text-muted-foreground">Badges</p>
            </div>
          </div>

          {/* XP progress */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Level {profile.level}</span>
              <span className="text-accent font-bold">{profile.xp % 100}/100 XP</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }} animate={{ width: `${profile.xp % 100}%` }} />
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="glass-card rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <div className="flex flex-wrap gap-2">
                  {TITLES.map((t) => (
                    <button key={t} onClick={() => setTitle(t)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                        title === t ? "bg-primary text-primary-foreground neon-glow" : "bg-muted text-muted-foreground"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-display font-bold text-sm neon-glow">
                Save Changes
              </motion.button>
            </motion.div>
          )}

          {/* Badges */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-foreground flex items-center gap-2">
              <Award size={18} className="text-accent" /> Badges
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((badge: string) => {
                const Icon = BADGE_ICONS[badge] || Shield;
                return (
                  <div key={badge} className="bg-muted/50 border border-border rounded-xl p-3 text-center space-y-1">
                    <Icon size={20} className="mx-auto text-accent" />
                    <p className="text-[10px] text-muted-foreground font-medium">{badge}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;