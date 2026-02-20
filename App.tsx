import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import AppLockScreen from "@/components/AppLockScreen";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import BreathePage from "./pages/BreathePage";
import MoodPage from "./pages/MoodPage";
import JournalPage from "./pages/JournalPage";
import GamesPage from "./pages/GamesPage";
import LearnPage from "./pages/LearnPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import "./i18n";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const lockEnabled = localStorage.getItem("mb_app_lock") === "true";
    const hasPasscode = !!localStorage.getItem("mb_passcode");
    if (lockEnabled && hasPasscode) setIsLocked(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (isLocked) return <AppLockScreen onUnlock={() => setIsLocked(false)} />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/breathe" element={<BreathePage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
