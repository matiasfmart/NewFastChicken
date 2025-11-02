
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Package } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, InventoryItem, Combo } from '@/lib/types';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { OrderAPI, ComboAPI, InventoryAPI } from '@/api';

type ComboSaleData = {
  name: string;
  type: string;
  sales: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ✅ Usando APIs internas - sin Firebase directo
        const [ordersData, combosData, inventoryData] = await Promise.all([
          OrderAPI.getByDate(today),
          ComboAPI.getAll(),
          InventoryAPI.getAll()
        ]);

        setOrders(ordersData);
        setCombos(combosData);
        setInventory(inventoryData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoizar cálculos pesados para evitar recalcular en cada render
  const metrics = useMemo(() => {
    if (isLoading) return null;

    const salesMap = new Map<string, { sales: number, revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
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

    const comboSalesData: ComboSaleData[] = Array.from(salesMap.entries()).map(([comboId, data]) => {
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

    const totalSales = comboSalesData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = comboSalesData.reduce((sum, item) => sum + item.revenue, 0);

    const salesByType = comboSalesData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.sales;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(salesByType).map(type => ({
      name: type,
      value: salesByType[type]
    }));

    const topSeller = [...comboSalesData].sort((a, b) => b.sales - a.sales)[0] || null;
    const lowStockItems = inventory.filter(item => item.stock < 10).sort((a, b) => a.stock - b.stock);

    return {
      comboSalesData,
      totalSales,
      totalRevenue,
      chartData,
      topSeller,
      lowStockItems,
      ordersCount: orders.length
    };
  }, [orders, combos, inventory, isLoading]);

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
    );
  }

  if (!metrics) return null;

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
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString('es-AR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (Hoy)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.ordersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item más vendido (Hoy)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topSeller?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{metrics.topSeller?.sales || 0} vendidos hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock bajo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockItems.length} items</div>
            <p className="text-xs text-muted-foreground truncate" title={metrics.lowStockItems.map(i => i.name).join(', ')}>
              {metrics.lowStockItems.map(i => i.name).join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        comboSalesData={metrics.comboSalesData}
        chartData={metrics.chartData}
        totalSales={metrics.totalSales}
      />
    </div>
  );
}
