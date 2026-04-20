import { useState, useEffect } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { Dashboard } from "@/app/components/Dashboard";
import { Toaster } from "@/app/components/ui/sonner";
// Importamos el cliente de Supabase
import { supabase } from "@/lib/supabase"; 

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión actual apenas carga la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en la autenticación (Login, Logout, Token renovado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No hace falta setear el estado manualmente, 
    // onAuthStateChange se encarga de detectar el logout
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
        // Pasamos el email del usuario de la sesión de Supabase
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