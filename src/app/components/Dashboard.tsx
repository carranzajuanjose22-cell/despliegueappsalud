import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar, Users, Wallet, Bell, LogOut, Stethoscope } from "lucide-react"; // Cambié DollarSign por Wallet
import { AgendaTab } from "./AgendaTab";
import { PatientsTab, type Patient } from "./PatientsTab";
import { CobrosTab } from "./CobrosTab"; // <--- Importamos el nuevo componente
import { NotificationsTab } from "./NotificationsTab";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; 

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

export function Dashboard({ username, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("agenda");
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Mostrar notificación de bienvenida
  useEffect(() => {
    toast.success(`¡Bienvenido/a, ${username}!`, {
      description: "Sesión iniciada correctamente"
    });
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Gestor de Salud</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Profesional: {username}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm p-1 h-auto">
            <TabsTrigger value="agenda" className="py-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="py-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="cobros" className="py-3 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden md:inline">Caja y Cobros</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="py-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Avisos</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenido de la Agenda */}
          <TabsContent value="agenda">
            <AgendaTab />
          </TabsContent>

          {/* Contenido de Pacientes (Podés seguir usando tu PatientsTab o pasarlo a Supabase) */}
          <TabsContent value="pacientes">
             <div className="p-8 text-center border-2 border-dashed rounded-xl text-gray-400">
                Sección de pacientes en desarrollo con base de datos
             </div>
          </TabsContent>

          {/* Contenido de Cobros - AQUÍ CARGAMOS EL NUEVO COMPONENTE */}
          <TabsContent value="cobros">
            <CobrosTab /> 
          </TabsContent>

          {/* Contenido de Notificaciones */}
          <TabsContent value="notificaciones">
            <div className="p-8 text-center text-gray-500">
               Revisa tus turnos de mañana y pendientes de cobro.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}