'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Package, Receipt, TrendingUp } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, InventoryItem, Combo } from '@/lib/types';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { DateRangeSelector } from '@/components/admin/DateRangeSelector';
import { OrderAPI, ComboAPI, InventoryAPI } from '@/api';
import { startOfDay, endOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

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

  // ✅ Estado simplificado: solo un objeto con las fechas
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const today = new Date();
    return {
      from: startOfDay(today),
      to: endOfDay(today)
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersData, combosData, inventoryData] = await Promise.all([
          OrderAPI.getAll(),
          ComboAPI.getAll(),
          InventoryAPI.getAll()
        ]);

        // Filtrar órdenes por rango
        const filteredOrders = ordersData.filter(o => {
          const orderDate = o.createdAt instanceof Timestamp
            ? o.createdAt.toDate()
            : o.createdAt instanceof Date
              ? o.createdAt
              : new Date(o.createdAt);
          return orderDate >= dateRange.from && orderDate <= dateRange.to;
        });

        setOrders(filteredOrders);
        setCombos(combosData);
        setInventory(inventoryData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Memoizar cálculos pesados para evitar recalcular en cada render
  const metrics = useMemo(() => {
    if (isLoading) return null;

    const salesMap = new Map<string, { sales: number, revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        let itemKey: string;

        // Manejar combos
        if (item.combo) {
          itemKey = `combo-${item.combo.id}`;
        }
        // Manejar productos individuales
        else {
          const individualProduct = item.customizations.product || item.customizations.drink || item.customizations.side;
          if (!individualProduct) continue; // Skip si no hay producto

          itemKey = `individual-${individualProduct.id}`;
        }

        const current = salesMap.get(itemKey) || { sales: 0, revenue: 0 };
        current.sales += item.quantity;
        current.revenue += item.finalUnitPrice * item.quantity;
        salesMap.set(itemKey, current);
      }
    }

    const comboDetails = combos.reduce((acc, combo) => {
      acc[combo.id] = combo;
      return acc;
    }, {} as Record<string, Combo>);

    const comboSalesData: ComboSaleData[] = Array.from(salesMap.entries()).map(([itemKey, data]) => {
      let name: string;
      let friendlyType: string;

      // Si es un combo
      if (itemKey.startsWith('combo-')) {
        const comboId = itemKey.replace('combo-', '');
        const combo = comboDetails[comboId];
        name = combo?.name || `Combo ID: ${comboId}`;

        const comboType = combo?.type || 'Otro';
        if (comboType === 'PO') friendlyType = 'Pollo';
        else if (comboType === 'BG') friendlyType = 'Hamburguesa';
        else if (['E', 'ES', 'EP'].includes(comboType)) friendlyType = 'Individual';
        else friendlyType = 'Otro';
      }
      // Si es producto individual
      else {
        const productId = itemKey.replace('individual-', '');
        const product = inventory.find(inv => inv.id === productId);
        name = product?.name || `Producto ID: ${productId}`;
        friendlyType = 'Individual';
      }

      return {
        name,
        type: friendlyType,
        sales: data.sales,
        revenue: data.revenue
      };
    });

    const totalSales = comboSalesData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = comboSalesData.reduce((sum, item) => sum + item.revenue, 0);

    // ✅ NUEVO: Gráfico por combos individuales (top 5) en lugar de categorías
    const topCombos = [...comboSalesData]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const chartData = topCombos.map(combo => ({
      name: combo.name,
      value: combo.sales
    }));

    // ✅ NUEVO: Datos de tipo de entrega
    const deliveryData = [
      {
        name: 'Local',
        value: orders.filter(o => o.deliveryType === 'local').length,
        revenue: orders.filter(o => o.deliveryType === 'local').reduce((sum, o) => sum + o.total, 0)
      },
      {
        name: 'Para Llevar',
        value: orders.filter(o => o.deliveryType === 'takeaway').length,
        revenue: orders.filter(o => o.deliveryType === 'takeaway').reduce((sum, o) => sum + o.total, 0)
      },
      {
        name: 'Delivery',
        value: orders.filter(o => o.deliveryType === 'delivery').length,
        revenue: orders.filter(o => o.deliveryType === 'delivery').reduce((sum, o) => sum + o.total, 0)
      }
    ];

    const topSeller = [...comboSalesData].sort((a, b) => b.sales - a.sales)[0] || null;
    const lowStockItems = inventory.filter(item => item.stock < 10).sort((a, b) => a.stock - b.stock);

    // Ticket promedio
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      comboSalesData,
      totalSales,
      totalRevenue,
      chartData,
      deliveryData,
      topSeller,
      lowStockItems,
      ordersCount: orders.length,
      avgTicket
    };
  }, [orders, combos, inventory, isLoading]);

  // ✅ Función simplificada para el label
  const getRangeLabel = () => {
    const today = startOfDay(new Date());
    const isToday = dateRange.from.getTime() === today.getTime() &&
                    dateRange.to.getTime() === endOfDay(new Date()).getTime();

    if (isToday) return 'Hoy';
    return `${dateRange.from.toLocaleDateString('es-AR')} - ${dateRange.to.toLocaleDateString('es-AR')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Resumen de ventas y métricas del negocio</p>
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-1" /></CardContent></Card>
          ))}
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen de ventas y métricas del negocio</p>
        </div>
        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Cards de métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos ({getRangeLabel()})</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString('es-AR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos ({getRangeLabel()})</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics.ordersCount}</div>
          </CardContent>
        </Card>

        {/* ✅ NUEVA: Ticket Promedio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(metrics.avgTicket).toLocaleString('es-AR')}</div>
            <p className="text-xs text-muted-foreground">por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item más vendido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topSeller?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{metrics.topSeller?.sales || 0} vendidos</p>
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

      {/* Gráficos de ventas */}
      <DashboardCharts
        comboSalesData={metrics.comboSalesData}
        chartData={metrics.chartData}
        deliveryData={metrics.deliveryData}
        totalSales={metrics.totalSales}
      />
    </div>
  );
}
