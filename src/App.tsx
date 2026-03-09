import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OnboardingPage from "./pages/Onboarding";
import UpgradePage from "./pages/upgrade";
import PublicProfile from "./pages/PublicProfile";
import AboutPage from "./pages/About";
import BlogPage from "./pages/Blog";
import ContactPage from "./pages/Contact";
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Optional: Protected Route Wrapper
// This ensures users who haven't verified their email/OTP can't see the dashboard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected App Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upgrade" 
            element={
              <ProtectedRoute>
                <UpgradePage />
              </ProtectedRoute>
            } 
          />

          {/* Dynamic Username Route (Must be near the end) */}
          <Route path="/:username" element={<PublicProfile />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;