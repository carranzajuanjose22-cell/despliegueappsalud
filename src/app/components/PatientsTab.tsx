import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Users, Plus, Trash2, Search, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  healthInsurance: string;
  notes: string;
}

interface PatientsTabProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, "id">) => void;
  onDeletePatient: (id: string) => void;
}

export function PatientsTab({ patients, onAddPatient, onDeletePatient }: PatientsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    healthInsurance: "",
    notes: ""
  });

  const handleAddPatient = () => {
    if (!newPatient.name) {
      toast.error("El nombre del paciente es obligatorio");
      return;
    }

    onAddPatient(newPatient);
    setNewPatient({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      healthInsurance: "",
      notes: ""
    });
    setIsDialogOpen(false);
    toast.success("Paciente agregado exitosamente");
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.healthInsurance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Pacientes
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
                  <DialogDescription>
                    Complete la información del paciente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                      placeholder="paciente@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={newPatient.birthDate}
                      onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthInsurance">Obra Social</Label>
                    <Input
                      id="healthInsurance"
                      value={newPatient.healthInsurance}
                      onChange={(e) => setNewPatient({ ...newPatient, healthInsurance: e.target.value })}
                      placeholder="Ej: OSDE, Swiss Medical, Particular"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas / Observaciones</Label>
                    <Input
                      id="notes"
                      value={newPatient.notes}
                      onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                      placeholder="Información adicional"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPatient}>
                    Guardar Paciente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o obra social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Obra Social</TableHead>
                    <TableHead>Fecha Nac.</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {patient.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{patient.healthInsurance || "-"}</TableCell>
                      <TableCell>
                        {patient.birthDate ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(patient.birthDate).toLocaleDateString("es-AR")}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onDeletePatient(patient.id);
                            toast.success("Paciente eliminado");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
