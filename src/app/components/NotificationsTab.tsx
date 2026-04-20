import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Bell, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "./AgendaTab";
import type { Payment } from "./PaymentsTab";

interface Notification {
  id: string;
  type: "appointment" | "payment";
  priority: "high" | "medium" | "low";
  message: string;
  date: Date;
  read: boolean;
}

interface NotificationsTabProps {
  appointments: Appointment[];
  payments: Payment[];
}

export function NotificationsTab({ appointments, payments }: NotificationsTabProps) {
  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const tomorrow = addDays(new Date(), 1);
    const today = new Date();

    // Notificaciones de turnos del día siguiente
    const tomorrowAppointments = appointments.filter(apt => 
      isSameDay(apt.date, tomorrow) && apt.status !== "cancelado"
    );

    tomorrowAppointments.forEach(apt => {
      notifications.push({
        id: `apt-${apt.id}`,
        type: "appointment",
        priority: "high",
        message: `Recordatorio: Turno con ${apt.patientName} mañana a las ${apt.time}`,
        date: apt.date,
        read: false
      });
    });

    // Notificaciones de turnos de hoy
    const todayAppointments = appointments.filter(apt => 
      isSameDay(apt.date, today) && apt.status !== "cancelado"
    );

    todayAppointments.forEach(apt => {
      notifications.push({
        id: `apt-today-${apt.id}`,
        type: "appointment",
        priority: "high",
        message: `Turno HOY con ${apt.patientName} a las ${apt.time}`,
        date: apt.date,
        read: false
      });
    });

    // Notificaciones de cobros pendientes de registro
    const pendingPayments = payments.filter(p => !p.registered);
    
    pendingPayments.forEach(payment => {
      const daysSince = Math.floor((today.getTime() - payment.date.getTime()) / (1000 * 60 * 60 * 24));
      const priority = daysSince > 7 ? "high" : daysSince > 3 ? "medium" : "low";
      
      notifications.push({
        id: `pay-${payment.id}`,
        type: "payment",
        priority,
        message: `Recordatorio: Registrar cobro de ${payment.patientName} - $${payment.amount.toLocaleString("es-AR")} (${format(payment.date, "dd/MM/yyyy", { locale: es })})`,
        date: payment.date,
        read: false
      });
    });

    return notifications.sort((a, b) => {
      // Ordenar por prioridad y luego por fecha
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.date.getTime() - a.date.getTime();
    });
  };

  const notifications = generateNotifications();
  const highPriorityCount = notifications.filter(n => n.priority === "high").length;
  const mediumPriorityCount = notifications.filter(n => n.priority === "medium").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-gray-500 mt-1">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Alta Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Prioridad Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mediumPriorityCount}</div>
            <p className="text-xs text-gray-500 mt-1">Para revisar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones pendientes</p>
              <p className="text-sm text-gray-400 mt-2">
                Se mostrarán recordatorios de turnos y cobros pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`border-l-4 ${getPriorityColor(notification.priority)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${notification.priority === "high" ? "text-red-600" : notification.priority === "medium" ? "text-orange-600" : "text-blue-600"}`}>
                        {notification.type === "appointment" ? (
                          <Calendar className="h-5 w-5" />
                        ) : (
                          <DollarSign className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">{notification.message}</p>
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityColor(notification.priority)} flex items-center gap-1 whitespace-nowrap`}
                          >
                            {getPriorityIcon(notification.priority)}
                            {notification.priority === "high" ? "Alta" : notification.priority === "medium" ? "Media" : "Baja"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(notification.date, "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Sistema de Notificaciones Activo</p>
              <p className="text-xs text-blue-700 mt-1">
                • Se enviarán recordatorios de turnos con 1 día de anticipación<br />
                • Se mostrarán alertas de cobros pendientes de registro<br />
                • Las notificaciones se actualizan automáticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
