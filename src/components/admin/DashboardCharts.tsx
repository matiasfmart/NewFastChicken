'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
};

interface DashboardChartsProps {
  comboSalesData: ComboSaleData[];
  chartData: ChartData[];
  totalSales: number;
}

export function DashboardCharts({ comboSalesData, chartData, totalSales }: DashboardChartsProps) {
  return (
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
                  <TableCell className="text-right">
                    {totalSales > 0 ? ((item.sales / totalSales) * 100).toFixed(1) : 0}%
                  </TableCell>
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
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${totalSales > 0 ? ((value as number / totalSales) * 100).toFixed(1) : 0}%`,
                  'Porcentaje'
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
