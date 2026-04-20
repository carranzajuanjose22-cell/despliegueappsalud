import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para INICIAR SESIÓN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Completá todos los campos");
    
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  // Función para CREAR CUENTA
  const handleSignUp = async () => {
    if (!email || !password) return setError("Debes ingresar email y clave para registrarte");
    if (password.length < 6) return setError("La clave debe tener al menos 6 caracteres");

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Gestor de Salud</CardTitle>
          <CardDescription>
            Acceso exclusivo para profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 font-medium">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">O</span></div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" 
                onClick={handleSignUp}
                disabled={loading}
              >
                Registrarme como profesional
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 