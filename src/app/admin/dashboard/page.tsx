
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Package } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, Timestamp, getDocs } from 'firebase/firestore';
import type { Order, InventoryItem, Combo } from '@/lib/types';
import { getCombos } from '@/services/comboService';
import { getInventoryItems } from '@/services/inventoryService';

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
  const firestore = useFirestore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const ordersQuery = query(
              collection(firestore, 'orders'),
              where('createdAt', '>=', Timestamp.fromDate(today)),
              where('createdAt', '<', Timestamp.fromDate(tomorrow))
          );
          
          const [ordersSnapshot, combosData, inventoryData] = await Promise.all([
              getDocs(ordersQuery),
              getCombos(firestore),
              getInventoryItems(firestore)
          ]);

          const ordersResult = ordersSnapshot.docs.map(d => ({...d.data(), id: d.id, createdAt: d.data().createdAt.toDate() } as Order));

          setOrders(ordersResult);
          setCombos(combosData);
          setInventory(inventoryData);

      } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
      } finally {
          setIsLoading(false);
      }
  }

  useEffect(() => {
    fetchData();
  }, [firestore]);


  const { comboSalesData, totalSales, totalRevenue, chartData, topSeller } = useMemo(() => {
    if (isLoading) return { comboSalesData: [], totalSales: 0, totalRevenue: 0, chartData: [], topSeller: null };

    const salesMap = new Map<string, { sales: number, revenue: number }>();

    for(const order of orders) {
        for(const item of order.items) {
            // It might happen that a combo was deleted but orders still reference it.
            const comboId = item.combo?.id;
            if (!comboId) continue;
            
            const current = salesMap.get(comboId) || { sales: 0, revenue: 0 };
            current.sales += item.quantity;
            current.revenue += item.finalUnitPrice * item.quantity;
            salesMap.set(comboId, current);
        }
    }
    
    const comboDetails = combos.reduce((acc, combo) => {
        acc[combo.id] = combo;
        return acc;
    }, {} as Record<string, Combo>);

    const data: ComboSaleData[] = Array.from(salesMap.entries()).map(([comboId, data]) => {
        const combo = comboDetails[comboId];
        const comboType = combo?.type || 'Otro';
        let friendlyType = 'Otro';
        if (comboType === 'PO') friendlyType = 'Pollo';
        else if (comboType === 'BG') friendlyType = 'Hamburguesa';
        else if (['E', 'ES', 'EP'].includes(comboType)) friendlyType = 'Individual';

        return {
            name: combo?.name || `ID: ${comboId}`,
            type: friendlyType,
            sales: data.sales,
            revenue: data.revenue
        };
    });

    const totalGeneratedSales = data.reduce((sum, item) => sum + item.sales, 0);
    const totalGeneratedRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    const salesByType = data.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.sales;
        return acc;
    }, {} as Record<string, number>);

    const generatedChartData = Object.keys(salesByType).map(type => ({
        name: type,
        value: salesByType[type]
    }));

    const generatedTopSeller = [...data].sort((a,b) => b.sales - a.sales)[0] || null;

    return {
        comboSalesData: data,
        totalSales: totalGeneratedSales,
        totalRevenue: totalGeneratedRevenue,
        chartData: generatedChartData,
        topSeller: generatedTopSeller
    }

  }, [orders, combos, isLoading]);

  const lowStockItems = useMemo(() => inventory.filter(item => item.stock < 10).sort((a, b) => a.stock - b.stock), [inventory]);


  if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido, Administrador</h1>
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
              {/* <p className="text-xs text-muted-foreground">+20.1% desde ayer</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos (Hoy)</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{orders.length}</div>
               {/* <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item más vendido (Hoy)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topSeller?.name || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">{topSeller?.sales || 0} vendidos hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock bajo</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length} items</div>
              <p className="text-xs text-muted-foreground truncate" title={lowStockItems.map(i => i.name).join(', ')}>{lowStockItems.map(i => i.name).join(', ')}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Ventas por Combo (Hoy)</CardTitle>
                    <CardDescription>Resumen de ventas para cada combo en el día.</CardDescription>
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
                                    <TableCell className="text-right">{totalSales > 0 ? ((item.sales / totalSales) * 100).toFixed(1) : 0}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle>Ventas por Categoría (Hoy)</CardTitle>
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
                            <Tooltip formatter={(value) => [`${totalSales > 0 ? ((value as number / totalSales) * 100).toFixed(1) : 0}%`, 'Porcentaje']}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
