import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar } from "@/app/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Importante para la conexión

export interface Appointment {
  id: string;
  patientName: string;
  date: Date;
  time: string;
  phone: string;
  notes: string;
  status: "confirmado" | "pendiente" | "cancelado";
}

export function AgendaTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    time: "",
    phone: "",
    notes: "",
    status: "pendiente" as const
  });

  // 1. Cargar turnos desde Supabase
  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_time', { ascending: true });

    if (error) {
      toast.error("Error al cargar turnos");
    } else {
      const formatted = data.map((apt: any) => ({
        id: apt.id,
        patientName: apt.patient_name,
        date: parseISO(apt.appointment_date),
        time: apt.appointment_time,
        phone: apt.phone || "",
        notes: apt.notes || "",
        status: apt.status
      }));
      setAppointments(formatted);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 2. Guardar nuevo turno
  const handleAddAppointment = async () => {
    if (!newAppointment.patientName || !newAppointment.time) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('appointments')
      .insert([{
        patient_name: newAppointment.patientName,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: newAppointment.time,
        phone: newAppointment.phone,
        notes: newAppointment.notes,
        status: newAppointment.status
      }]);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Turno agregado exitosamente");
      setIsDialogOpen(false);
      setNewAppointment({ patientName: "", time: "", phone: "", notes: "", status: "pendiente" });
      fetchAppointments();
    }
    setLoading(false);
  };

  // 3. Eliminar turno
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Turno eliminado");
      fetchAppointments();
    }
  };

  // 4. Actualizar estado
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) toast.error("Error al actualizar");
    else fetchAppointments();
  };

  const appointmentsForSelectedDate = appointments.filter(
    apt => format(apt.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-800";
      case "pendiente": return "bg-yellow-100 text-yellow-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Columna Izquierda: Calendario */}
      <Card className="lg:col-span-4 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <CalendarIcon className="h-5 w-5" />
            Calendario
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
            className="rounded-md border shadow-sm"
          />
        </CardContent>
      </Card>

      {/* Columna Derecha: Lista de Turnos */}
      <Card className="lg:col-span-8">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              Turnos: {format(selectedDate, "dd 'de' MMMM", { locale: es })}
            </CardTitle>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Turno
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agendar Paciente</DialogTitle>
                  <DialogDescription>
                    Fecha seleccionada: {format(selectedDate, "PPP", { locale: es })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Nombre Completo *</Label>
                    <Input id="patient" value={newAppointment.patientName} onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })} placeholder="Nombre del paciente" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora *</Label>
                      <Input id="time" type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado Inicial</Label>
                      <Select value={newAppointment.status} onValueChange={(value: any) => setNewAppointment({ ...newAppointment, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de contacto</Label>
                    <Input id="phone" value={newAppointment.phone} onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })} placeholder="Ej: 351..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddAppointment} disabled={loading} className="bg-blue-600">
                    {loading ? "Guardando..." : "Confirmar Turno"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
                No hay pacientes para este día
              </div>
            ) : (
              appointmentsForSelectedDate.map((apt) => (
                <Card key={apt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full text-blue-600 font-bold">
                        {apt.time}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patientName}</p>
                        <p className="text-sm text-gray-500">{apt.phone || "Sin teléfono"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Select
                        value={apt.status}
                        onValueChange={(val) => handleUpdateStatus(apt.id, val)}
                      >
                        <SelectTrigger className={`h-8 w-32 text-xs ${getStatusColor(apt.status)} font-semibold border-none`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(apt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}