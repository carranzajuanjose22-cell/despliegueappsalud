import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DollarSign, Plus, Trash2, Calendar, Filter, CreditCard, Wallet, Landmark, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export interface Payment {
  id: string;
  patientName: string;
  date: Date;
  time: string;
  amount: number;
  healthInsurance: string;
  paymentMethod: "efectivo" | "transferencia" | "debito" | "credito";
  notes: string;
  registered: boolean;
}

interface PaymentsTabProps {
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  onDeletePayment: (id: string) => void;
  onToggleRegistered: (id: string) => void;
}

export function PaymentsTab({ payments, onAddPayment, onDeletePayment, onToggleRegistered }: PaymentsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "registered">("all");
  const [newPayment, setNewPayment] = useState({
    patientName: "",
    date: new Date(),
    time: "",
    amount: "",
    healthInsurance: "",
    paymentMethod: "efectivo" as const,
    notes: "",
    registered: false
  });

  const handleAddPayment = () => {
    if (!newPayment.patientName || !newPayment.amount || !newPayment.time) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    onAddPayment({
      ...newPayment,
      amount: parseFloat(newPayment.amount)
    });

    setNewPayment({
      patientName: "", date: new Date(), time: "", amount: "",
      healthInsurance: "", paymentMethod: "efectivo", notes: "", registered: false
    });
    setIsDialogOpen(false);
    toast.success("Cobro registrado exitosamente");
  };

  const filteredPayments = (payments || []).filter(p => {
    if (filterStatus === "pending") return !p.registered;
    if (filterStatus === "registered") return p.registered;
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = (payments || []).filter(p => !p.registered).reduce((sum, p) => sum + p.amount, 0);
  const registeredAmount = (payments || []).filter(p => p.registered).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Gestión de Cobros</h1>
        <p className="text-slate-500 font-medium">Control de ingresos y estados de facturación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm rounded-3xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total Cobros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">${totalAmount.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 text-rose-600">
              <Clock className="h-4 w-4" /> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">${pendingAmount.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 text-emerald-600">
              <Landmark className="h-4 w-4" /> Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">${registeredAmount.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cobros</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="registered">Registrados</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-black text-white rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Cobro
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="font-black">Registrar Cobro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Input className="rounded-xl" value={newPayment.patientName} onChange={(e) => setNewPayment({...newPayment, patientName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monto</Label>
                      <Input type="number" className="rounded-xl" value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Input type="time" className="rounded-xl" value={newPayment.time} onChange={(e) => setNewPayment({...newPayment, time: e.target.value})} />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Guardar</Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-bold">{format(payment.date, "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell className="font-medium text-slate-700">{payment.patientName}</TableCell>
                <TableCell className="capitalize text-xs">{payment.paymentMethod}</TableCell>
                <TableCell className="text-right font-black">${payment.amount.toLocaleString("es-AR")}</TableCell>
                <TableCell className="text-center">
                  <button 
                    onClick={() => onToggleRegistered(payment.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      payment.registered ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {payment.registered ? "Conciliado" : "Pendiente"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDeletePayment(payment.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}