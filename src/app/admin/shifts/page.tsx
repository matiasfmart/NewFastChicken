"use client";

import React, { useState, useEffect } from 'react';
import { ShiftAPI } from '@/api';
import type { Shift } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, DollarSign, User, TrendingUp, AlertCircle } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShiftDetailModal } from '@/components/admin/ShiftDetailModal';
import { DateRangeSelector } from '@/components/admin/DateRangeSelector';

export default function ShiftsHistoryPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado del filtro de fechas
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const today = new Date();
    return {
      from: startOfDay(today),
      to: endOfDay(today)
    };
  });

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchShifts();
  }, [dateRange]);

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const data = await ShiftAPI.getByDateRange(dateRange.from, dateRange.to);
      // Ordenar por fecha más reciente primero
      const sorted = data.sort((a, b) => {
        const dateA = a.startedAt instanceof Date ? a.startedAt : new Date(a.startedAt as any);
        const dateB = b.startedAt instanceof Date ? b.startedAt : new Date(b.startedAt as any);
        return dateB.getTime() - dateA.getTime();
      });
      setShifts(sorted);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date | any) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatTime = (date: Date | any) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'HH:mm', { locale: es });
  };

  const calculateDuration = (startedAt: Date | any, endedAt?: Date | any) => {
    const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
    const end = endedAt ? (endedAt instanceof Date ? endedAt : new Date(endedAt)) : new Date();

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Historial de Jornadas</h1>
        <div className="flex items-center gap-4">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Badge variant="outline" className="text-sm">
            {shifts.length} jornada{shifts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {shifts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay jornadas registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shifts.map((shift) => {
            const expectedCash = shift.initialCash + shift.totalRevenue;
            const hasDifference = shift.cashDifference !== undefined && shift.cashDifference !== 0;

            return (
              <Card
                key={shift.id}
                className={`cursor-pointer hover:bg-accent/50 transition-colors ${shift.status === 'open' ? 'border-primary' : ''}`}
                onClick={() => handleShiftClick(shift.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {shift.employeeName}
                    </CardTitle>
                    <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>
                      {shift.status === 'open' ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Fecha y duración */}
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">{formatDate(shift.startedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Horario:</span>
                      <span className="font-medium">
                        {formatTime(shift.startedAt)} - {shift.endedAt ? formatTime(shift.endedAt) : 'Activa'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({calculateDuration(shift.startedAt, shift.endedAt)})
                      </span>
                    </div>
                  </div>

                  {/* Métricas financieras */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fondo inicial:</span>
                      <span className="font-medium">{formatCurrency(shift.initialCash)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Ventas:</span>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(shift.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total órdenes:</span>
                      <span className="font-medium">{shift.totalOrders}</span>
                    </div>
                  </div>

                  {/* Cierre de caja */}
                  {shift.status === 'closed' && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Efectivo esperado:</span>
                        <span className="font-medium">{formatCurrency(expectedCash)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Efectivo real:</span>
                        <span className="font-medium">{formatCurrency(shift.actualCash || 0)}</span>
                      </div>
                      {hasDifference && (
                        <div className={`flex items-center justify-between text-sm p-2 rounded ${
                          (shift.cashDifference || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <div className="flex items-center gap-1">
                            <AlertCircle className={`h-4 w-4 ${
                              (shift.cashDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`} />
                            <span className="font-medium">Diferencia:</span>
                          </div>
                          <span className={`font-bold ${
                            (shift.cashDifference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(shift.cashDifference || 0) >= 0 ? '+' : ''}{formatCurrency(shift.cashDifference || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalle */}
      <ShiftDetailModal
        shiftId={selectedShiftId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
