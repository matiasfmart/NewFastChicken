'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { combos as allCombos } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

type ComboSaleData = {
  name: string;
  type: string;
  sales: number;
  revenue: number;
};

type ChartData = {
    name: string;
    value: number;
}

export default function AdminDashboardPage() {
  const [comboSalesData, setComboSalesData] = useState<ComboSaleData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topSeller, setTopSeller] = useState<ComboSaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate random data only on the client side
    const generatedData = allCombos.map(combo => {
        const sales = Math.floor(Math.random() * 200) + 50;
        return {
            name: combo.name,
            type: combo.type === 'PO' ? 'Pollo' : (combo.type === 'BG' ? 'Hamburguesa' : (['E', 'ES', 'EP'].includes(combo.type) ? 'Individual' : 'Otro')),
            sales: sales,
            revenue: combo.price * sales
        };
    });

    const totalGeneratedSales = generatedData.reduce((sum, item) => sum + item.sales, 0);
    const totalGeneratedRevenue = generatedData.reduce((sum, item) => sum + item.revenue, 0);

    const salesByType = generatedData.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.sales;
        return acc;
    }, {} as Record<string, number>);

    const generatedChartData = Object.keys(salesByType).map(type => ({
        name: type,
        value: salesByType[type]
    }));

    const generatedTopSeller = [...generatedData].sort((a,b) => b.sales - a.sales)[0];

    setComboSalesData(generatedData);
    setTotalSales(totalGeneratedSales);
    setTotalRevenue(totalGeneratedRevenue);
    setChartData(generatedChartData);
    setTopSeller(generatedTopSeller);
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs only once on the client

  if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-1" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-1" /></CardContent></Card>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full rounded-full" /></CardContent></Card>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido, Administrador</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales (Hoy)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString('es-AR')}</div>
              <p className="text-xs text-muted-foreground">+20.1% desde ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSales}</div>
              <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item más vendido</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topSeller?.name}</div>
              <p className="text-xs text-muted-foreground">{topSeller?.sales} vendidos hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock bajo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 items</div>
              <p className="text-xs text-muted-foreground">Papas fritas, Coca Cola, Alitas</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Ventas por Combo</CardTitle>
                    <CardDescription>Resumen de ventas para cada combo.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Combo</TableHead>
                                <TableHead className="text-right">Ventas</TableHead>
                                <TableHead className="text-right">Ingresos</TableHead>
                                <TableHead className="text-right">% Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comboSalesData.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.sales}</TableCell>
                                    <TableCell className="text-right">${item.revenue.toLocaleString('es-AR')}</TableCell>
                                    <TableCell className="text-right">{((item.sales / totalSales) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle>Ventas por Categoría</CardTitle>
                    <CardDescription>Distribución de ventas por tipo de producto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${((value as number / totalSales) * 100).toFixed(1)}%`, name]}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
