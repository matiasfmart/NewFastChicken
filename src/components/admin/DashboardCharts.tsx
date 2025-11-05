'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type ComboSaleData = {
  name: string;
  type: string;
  sales: number;
  revenue: number;
};

type ChartData = {
  name: string;
  value: number;
};

type DeliveryData = {
  name: string;
  value: number;
  revenue: number;
};

interface DashboardChartsProps {
  comboSalesData: ComboSaleData[];
  chartData: ChartData[];
  deliveryData: DeliveryData[];
  totalSales: number;
}

export function DashboardCharts({ comboSalesData, chartData, deliveryData, totalSales }: DashboardChartsProps) {
  const totalOrders = deliveryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      {/* Tabla de ventas por combo */}
      <Card>
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
                  <TableCell className="text-right">
                    {totalSales > 0 ? ((item.sales / totalSales) * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Combos Más Vendidos</CardTitle>
            <CardDescription>Los 5 combos con mayor cantidad de ventas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${value} unidades (${totalSales > 0 ? ((value as number / totalSales) * 100).toFixed(1) : 0}%)`,
                    'Ventas'
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local vs Delivery</CardTitle>
            <CardDescription>Distribución de pedidos por tipo de entrega.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {deliveryData.map((_, index) => (
                    <Cell key={`cell-delivery-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const percentage = totalOrders > 0 ? ((value as number / totalOrders) * 100).toFixed(1) : 0;
                    const revenue = props.payload.revenue;
                    return [
                      `${value} pedidos (${percentage}%) - $${revenue.toLocaleString('es-AR')}`,
                      'Pedidos'
                    ];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
