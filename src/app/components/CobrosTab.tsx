import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Trash2, TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, Banknote, Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CobrosTab() {
  const [movements, setMovements] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("ingreso");
  const [method, setMethod] = useState("efectivo");
  const [loading, setLoading] = useState(false);

  const fetchMovements = async () => {
    const { data, error } = await supabase
      .from('cashflow')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMovements(data);
  };

  useEffect(() => { fetchMovements(); }, []);

  const handleSave = async () => {
    if (!desc || !amount) return toast.error("Completá los datos");
    setLoading(true);
    const { error } = await supabase.from('cashflow').insert([{
      description: desc,
      amount: parseFloat(amount),
      type,
      method
    }]);

    if (error) toast.error("Error al guardar");
    else {
      toast.success("Movimiento registrado");
      setDesc(""); setAmount("");
      fetchMovements();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('cashflow').delete().eq('id', id);
    if (!error) {
      toast.success("Eliminado");
      fetchMovements();
    }
  };

  // --- LÓGICA DE CÁLCULOS EN TIEMPO REAL ---
  
  // Totales por Método (Solo Ingresos)
  const totalEfectivo = movements
    .filter(m => m.type === 'ingreso' && m.method === 'efectivo')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalTransferencia = movements
    .filter(m => m.type === 'ingreso' && m.method === 'transferencia')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Totales Generales
  const ingresosTotales = totalEfectivo + totalTransferencia;
  const egresosTotales = movements
    .filter(m => m.type === 'egreso')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balanceNeto = ingresosTotales - egresosTotales;
  
  // Datos para el gráfico
  const chartData = [
    { name: 'Efectivo', total: totalEfectivo, color: '#22c55e' },
    { name: 'Transf.', total: totalTransferencia, color: '#3b82f6' },
    { name: 'Gastos', total: egresosTotales, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* PANEL DE SALDOS EN TIEMPO REAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500 bg-green-50/50">
          <CardContent className="flex items-center p-6">
            <div className="bg-green-500 p-3 rounded-full text-white mr-4">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Efectivo en Caja</p>
              <p className="text-2xl font-bold text-green-900">${totalEfectivo.toLocaleString('es-AR')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Total Transferencias</p>
              <p className="text-2xl font-bold text-blue-900">${totalTransferencia.toLocaleString('es-AR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-gray-500">Ingresos Brutos</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-800">${ingresosTotales.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-100">
            <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-red-700">Gastos Realizados</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-red-700">-${egresosTotales.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white shadow-xl">
            <CardHeader className="p-4"><CardTitle className="text-sm font-medium opacity-80">Balance Neto</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">${balanceNeto.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-full min-h-[200px]">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs uppercase text-gray-400 font-bold">Distribución de Caja</CardTitle></CardHeader>
          <CardContent className="p-0 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="h-fit shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600"/> Nuevo Registro de Caja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción del movimiento</label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej: Cobro consulta Juan Perez" className="focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto ($)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vía de pago</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo text-green-600">💵 Efectivo</SelectItem>
                    <SelectItem value="transferencia text-blue-600">🏦 Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <div className="flex gap-2">
                <Button 
                  variant={type === 'ingreso' ? 'default' : 'outline'} 
                  className={`flex-1 ${type === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setType('ingreso')}
                >Entrada</Button>
                <Button 
                  variant={type === 'egreso' ? 'default' : 'outline'} 
                  className={`flex-1 ${type === 'egreso' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => setType('egreso')}
                >Salida</Button>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-blue-700 hover:bg-blue-800 py-6 text-lg" disabled={loading}>
              {loading ? "Procesando..." : "Registrar en Caja"}
            </Button>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b"><CardTitle className="text-lg">Movimientos Recientes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                   <Wallet className="h-12 w-12 mb-2 opacity-20" />
                   <p>No hay actividad registrada</p>
                </div>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${m.type === 'ingreso' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {m.type === 'ingreso' ? <ArrowUpCircle className="text-green-600 h-5 w-5"/> : <ArrowDownCircle className="text-red-600 h-5 w-5"/>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{m.description}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(m.created_at).toLocaleDateString('es-AR')} • <span className="uppercase">{m.method}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${m.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.type === 'ingreso' ? '+' : '-'}${m.amount.toLocaleString('es-AR')}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="hover:bg-red-50 group">
                        <Trash2 className="h-4 w-4 text-gray-300 group-hover:text-red-600"/>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}