import { useState, useEffect } from "react";
// Cambiamos @/ por ./ para que Vercel encuentre los archivos sin errores
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "../lib/supabase"; // Subimos un nivel para encontrar lib

export default function App() {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-blue-600 animate-pulse font-medium">Cargando sistema...</p>
      </div>
    );
  }

  return (
    <>
      {session ? (
        <Dashboard 
          username={session.user.email?.split('@')[0] || "Profesional"} 
          onLogout={handleLogout} 
        />
      ) : (
        <LoginPage />
      )}
      <Toaster />
    </>
  );
}