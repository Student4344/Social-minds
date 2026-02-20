import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Fingerprint, Lock, ScanFace } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const THEMES = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
];

const FONT_SIZES = [
  { id: "small", label: "Small", class: "text-xs" },
  { id: "medium", label: "Medium", class: "text-sm" },
  { id: "large", label: "Large", class: "text-base" },
];

const BG_COLORS = [
  { id: "default", label: "Neon Purple", color: "hsl(260, 85%, 8%)" },
  { id: "midnight", label: "Midnight Blue", color: "hsl(220, 60%, 8%)" },
  { id: "forest", label: "Deep Forest", color: "hsl(160, 40%, 6%)" },
  { id: "charcoal", label: "Charcoal", color: "hsl(0, 0%, 10%)" },
  { id: "wine", label: "Wine Red", color: "hsl(340, 50%, 8%)" },
  { id: "ocean", label: "Ocean", color: "hsl(200, 60%, 8%)" },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "al", label: "Shqip", flag: "🇦🇱" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const Toggle = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 rounded-xl transition-colors">
    <span className="text-sm text-foreground font-medium">{label}</span>
    <div className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5 ${enabled ? "bg-primary" : "bg-muted"}`}>
      <motion.div animate={{ x: enabled ? 20 : 0 }} className="w-5 h-5 bg-foreground rounded-full shadow" />
    </div>
  </button>
);

// Check if WebAuthn is available
const isWebAuthnAvailable = () => {
  return !!(window.PublicKeyCredential && navigator.credentials);
};

const SettingsPage = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem("mb_theme") || "dark");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("mb_font_size") || "medium");
  const [bgColor, setBgColor] = useState(() => localStorage.getItem("mb_bg_color") || "default");
  const [anonymous, setAnonymous] = useState(false);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("mb_notifications") !== "false");
  const [contrast, setContrast] = useState(() => localStorage.getItem("mb_contrast") === "true");
  const [appLockEnabled, setAppLockEnabled] = useState(() => localStorage.getItem("mb_app_lock") === "true");
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem("mb_biometric") === "true");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.setAttribute("data-font-size", fontSize);
    document.documentElement.classList.toggle("high-contrast", contrast);
    const bg = BG_COLORS.find((b) => b.id === bgColor);
    if (bg) document.documentElement.style.setProperty("--background", bg.color);

    // Check biometric availability
    if (isWebAuthnAvailable()) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().then((available) => {
        setBiometricAvailable(available);
      }).catch(() => setBiometricAvailable(false));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("theme, font_size, anonymous_mode").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          if (data.theme) { setTheme(data.theme); localStorage.setItem("mb_theme", data.theme); }
          if (data.font_size) { setFontSize(data.font_size); localStorage.setItem("mb_font_size", data.font_size); }
          setAnonymous(data.anonymous_mode || false);
        }
      });
  }, [user]);

  const saveToProfile = async (updates: Record<string, any>) => {
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("user_id", user.id);
  };

  const handleTheme = (t: string) => {
    setTheme(t);
    document.documentElement.classList.toggle("light", t === "light");
    localStorage.setItem("mb_theme", t);
    saveToProfile({ theme: t });
    toast.success(`Theme: ${t}`);
  };

  const handleFontSize = (f: string) => {
    setFontSize(f);
    document.documentElement.setAttribute("data-font-size", f);
    localStorage.setItem("mb_font_size", f);
    saveToProfile({ font_size: f });
    toast.success(`Font size: ${f}`);
  };

  const handleBgColor = (id: string) => {
    setBgColor(id);
    const bg = BG_COLORS.find((b) => b.id === id);
    if (bg) document.documentElement.style.setProperty("--background", bg.color);
    localStorage.setItem("mb_bg_color", id);
    toast.success(`Background: ${bg?.label}`);
  };

  const handleAnonymous = () => {
    const next = !anonymous;
    setAnonymous(next);
    saveToProfile({ anonymous_mode: next });
    toast.success(next ? "Anonymous mode ON 🕶️" : "Anonymous mode OFF");
  };

  const handleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("mb_notifications", String(next));
    toast.success(next ? "Notifications ON 🔔" : "Notifications OFF 🔕");
  };

  const handleContrast = () => {
    const next = !contrast;
    setContrast(next);
    document.documentElement.classList.toggle("high-contrast", next);
    localStorage.setItem("mb_contrast", String(next));
    toast.success(next ? "High contrast ON" : "High contrast OFF");
  };

  const handleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    toast.success(`Language: ${LANGUAGES.find((l) => l.code === code)?.label}`);
  };

  const handleAppLock = () => {
    if (!appLockEnabled) {
      setShowPasscodeSetup(true);
    } else {
      setAppLockEnabled(false);
      localStorage.removeItem("mb_app_lock");
      localStorage.removeItem("mb_passcode");
      setBiometricEnabled(false);
      localStorage.removeItem("mb_biometric");
      localStorage.removeItem("mb_biometric_cred");
      toast.success("App lock disabled 🔓");
    }
  };

  const handleSetPasscode = () => {
    if (passcodeInput.length < 4) {
      toast.error("Passcode must be at least 4 digits");
      return;
    }
    localStorage.setItem("mb_passcode", passcodeInput);
    localStorage.setItem("mb_app_lock", "true");
    setAppLockEnabled(true);
    setShowPasscodeSetup(false);
    setPasscodeInput("");
    toast.success("App lock enabled 🔒");
  };

  const handleBiometric = async () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      localStorage.removeItem("mb_biometric");
      localStorage.removeItem("mb_biometric_cred");
      toast.success("Biometric unlock disabled");
      return;
    }

    try {
      // Register a credential for biometric unlock
      const userId = user?.id || "local-user";
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Social Bloom", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(userId),
            name: user?.email || "user",
            displayName: "Social Bloom User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        localStorage.setItem("mb_biometric", "true");
        localStorage.setItem("mb_biometric_cred", credential.id);
        setBiometricEnabled(true);

        // Also enable app lock if not already
        if (!appLockEnabled) {
          localStorage.setItem("mb_app_lock", "true");
          localStorage.setItem("mb_passcode", Math.random().toString().slice(2, 8));
          setAppLockEnabled(true);
        }

        toast.success("Biometric unlock enabled 🔐");
      }
    } catch (err: any) {
      console.error("Biometric setup failed:", err);
      toast.error("Biometric setup failed. Your device may not support this feature.");
    }
  };

  return (
    <div className="min-h-screen mesh-gradient pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 pt-8 space-y-4">
        <div className="text-center mb-2">
          <h1 className="font-display font-bold text-2xl text-foreground neon-text">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Customize your experience</p>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground font-bold uppercase px-4 pt-4 pb-2">Appearance</p>

          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Theme</p>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => handleTheme(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    theme === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Background</p>
            <div className="flex gap-2 flex-wrap">
              {BG_COLORS.map((bg) => (
                <button key={bg.id} onClick={() => handleBgColor(bg.id)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${
                    bgColor === bg.id ? "border-primary scale-110 neon-glow" : "border-border"
                  }`}
                  style={{ backgroundColor: bg.color }} title={bg.label} />
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Font Size</p>
            <div className="flex gap-2">
              {FONT_SIZES.map((f) => (
                <button key={f.id} onClick={() => handleFontSize(f.id)}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${f.class} ${
                    fontSize === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-3">
            <Toggle enabled={contrast} onToggle={handleContrast} label="High Contrast" />
          </div>
        </div>

        {/* Language */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground font-bold uppercase px-4 pt-4 pb-2">Language</p>
          <div className="px-4 pb-4 space-y-1">
            {LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => handleLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  i18n.language === lang.code ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted/30"
                }`}>
                <span className="text-lg">{lang.flag}</span> {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Notifications */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground font-bold uppercase px-4 pt-4 pb-2">Privacy & Notifications</p>
          <div className="px-4 pb-4 space-y-1">
            <Toggle enabled={notifications} onToggle={handleNotifications} label="🔔 Notifications" />
            <Toggle enabled={anonymous} onToggle={handleAnonymous} label="🕶️ Anonymous Mode" />
          </div>
        </div>

        {/* Security Lock */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground font-bold uppercase px-4 pt-4 pb-2">
            <span className="flex items-center gap-2"><Fingerprint size={14} /> Security Lock</span>
          </p>
          <div className="px-4 pb-4 space-y-3">
            <Toggle enabled={appLockEnabled} onToggle={handleAppLock} label="🔒 App Lock (Passcode)" />

            {biometricAvailable && (
              <Toggle enabled={biometricEnabled} onToggle={handleBiometric} label="🧬 Biometric Unlock (Face ID / Fingerprint)" />
            )}

            <p className="text-xs text-muted-foreground">
              {biometricAvailable
                ? "Use your device's biometrics or a passcode to unlock the app."
                : "When enabled, you'll need to enter your passcode each time you open the app."}
            </p>

            {showPasscodeSetup && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 4-6 digit passcode"
                    className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSetPasscode}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold">
                    Set Passcode
                  </button>
                  <button onClick={() => { setShowPasscodeSetup(false); setPasscodeInput(""); }}
                    className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground font-bold uppercase px-4 pt-4 pb-2">Security</p>
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground">
              🔒 Your data is encrypted and protected. All conversations are private and secured with end-to-end encryption.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
